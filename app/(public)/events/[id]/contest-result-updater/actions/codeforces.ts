"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import type {
    BaseCodeforcesResponse,
    CodeforcesStandingsResponse,
    ProcessedResult,
    UpdateResultsResponse,
} from "../types/codeforces";

const CODEFORCES_API = {
    BASE_URL: "https://codeforces.com/api",
    ENDPOINTS: {
        CONTEST_STANDINGS: "/contest.standings"
    }
} as const;

class CodeforcesAPIError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CodeforcesAPIError';
    }
}

interface CodeforcesError extends BaseCodeforcesResponse {
    status: "FAILED";
    comment: string;
}

function isCodeforcesError(data: BaseCodeforcesResponse): data is CodeforcesError {
    return data.status === "FAILED" &&
        typeof data.comment === "string" &&
        (
            data.comment.includes("handles:") ||
            data.comment.includes("contestId:")
        );
}

const getContestStandings = cache(async (
    contestId: string,
    handles: string[]
): Promise<CodeforcesStandingsResponse> => {
    const validHandles = handles.filter(Boolean);

    if (validHandles.length === 0) {
        throw new CodeforcesAPIError("No valid Codeforces handles found");
    }

    try {
        const handleString = validHandles.join(';');
        const url = `${CODEFORCES_API.BASE_URL}${CODEFORCES_API.ENDPOINTS.CONTEST_STANDINGS}?showUnofficial=true&contestId=${contestId}&handles=${handleString}`;

        const response = await fetch(url, {
            next: { revalidate: 0 },
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        // Check for Codeforces API error response
        if (isCodeforcesError(data)) {
            const errorMessage = data.comment
                .replace(/handles: /, '')
                .replace(/contestId: /, '');
            throw new CodeforcesAPIError(errorMessage);
        }

        if (!response.ok || data.status !== "OK" || !data.result) {
            throw new CodeforcesAPIError(
                'Invalid response from Codeforces API'
            );
        }

        return data as CodeforcesStandingsResponse;
    } catch (error) {
        if (error instanceof CodeforcesAPIError) {
            throw error;
        }
        throw new CodeforcesAPIError(
            `Failed to fetch standings: ${error instanceof Error ? error.message : String(error)}`
        );
    }
});

function processUserResults(
    handle: string,
    standings: CodeforcesStandingsResponse
): ProcessedResult {
    try {
        const result = standings.result!;

        // Find contest and practice participations
        const contestRow = result.rows.find(
            row => row.party.participantType === "CONTESTANT" &&
                row.party.members.some(m => m.handle.toLowerCase() === handle.toLowerCase())
        );

        const practiceRow = result.rows.find(
            row => row.party.participantType === "PRACTICE" &&
                row.party.members.some(m => m.handle.toLowerCase() === handle.toLowerCase())
        );

        if (!contestRow && !practiceRow) {
            return { solveCount: 0, upsolveCount: 0, absent: true };
        }

        // Count problems solved during contest
        const solveCount = contestRow?.problemResults.filter(
            problem => problem.points > 0
        ).length ?? 0;

        // Track problems solved during contest
        const contestSolvedProblems = new Set(
            contestRow?.problemResults
                .map((problem, index) => problem.points > 0 ? index : -1)
                .filter(index => index !== -1) ?? []
        );

        // Count upsolves (excluding problems solved during contest)
        const upsolveCount = practiceRow?.problemResults.reduce((count, problem, index) => {
            return count + (problem.points > 0 && !contestSolvedProblems.has(index) ? 1 : 0);
        }, 0) ?? 0;

        return {
            solveCount,
            upsolveCount,
            absent: !contestRow
        };
    } catch (error) {
        return {
            solveCount: 0,
            upsolveCount: 0,
            absent: true,
            error: `Failed to process results: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}

export async function updateCodeforcesResults(
    eventId: bigint,
    contestId: string,
    singleUserId?: string // New parameter for single user update
): Promise<UpdateResultsResponse> {
    try {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                eventRankLists: {
                    include: {
                        rankList: {
                            include: {
                                rankListUsers: {
                                    include: {
                                        user: {
                                            select: {
                                                id: true,
                                                codeforcesHandle: true,
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!event) {
            return { success: false, error: "Event not found" };
        }

        // Get unique users with Codeforces handles
        const users = event.eventRankLists
            .flatMap(erl => erl.rankList.rankListUsers)
            .map(rlu => rlu.user)
            .filter((user): user is typeof user & { codeforcesHandle: string } =>
                Boolean(user.codeforcesHandle)
            )
            .filter((user, index, self) =>
                index === self.findIndex(u => u.id === user.id)
            );

        if (users.length === 0) {
            return { success: false, error: "No users with Codeforces handles found" };
        }

        // Filter users based on singleUserId if provided
        let filteredUsers = users;
        if (singleUserId) {
            filteredUsers = users.filter(user => user.id === singleUserId);
            if (filteredUsers.length === 0) {
                return { success: false, error: "User not found or no Codeforces handle set" };
            }
        }

        const standings = await getContestStandings(
            contestId,
            filteredUsers.map(u => u.codeforcesHandle)
        );

        const processedResults: Record<string, ProcessedResult> = {};

        // Process results for each user
        filteredUsers.forEach(user => {
            processedResults[user.codeforcesHandle] = processUserResults(
                user.codeforcesHandle,
                standings
            );
        });

        // Update database
        await prisma.$transaction(async (tx) => {
            // Delete existing solve stats for this event
            await tx.solveStat.deleteMany({
                where: { eventId }
            });

            // Create new solve stats
            await Promise.all(filteredUsers.map(user => {
                const stats = processedResults[user.codeforcesHandle];

                return tx.solveStat.create({
                    data: {
                        userId: user.id,
                        eventId,
                        solveCount: BigInt(stats.solveCount),
                        upsolveCount: BigInt(stats.upsolveCount),
                        isPresent: !stats.absent,
                    }
                });
            }));
        });

        revalidatePath(`/events/${eventId}`);
        return { success: true, data: processedResults };

    } catch (error) {
        console.error("Update error:", error);

        let errorMessage = "Failed to update results";
        if (error instanceof CodeforcesAPIError) {
            errorMessage = error.message;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        return { success: false, error: errorMessage };
    }
}
