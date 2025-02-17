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
): Promise<{ success: boolean; data?: CodeforcesStandingsResponse; error?: string }> => {
    const validHandles = handles.filter(Boolean);

    if (validHandles.length === 0) {
        return {
            success: false,
            error: "No valid Codeforces handles found"
        };
    }

    try {
        const handleString = validHandles.join(';');
        const url = `${CODEFORCES_API.BASE_URL}${CODEFORCES_API.ENDPOINTS.CONTEST_STANDINGS}?showUnofficial=true&contestId=${contestId}&handles=${handleString}`;

        const response = await fetch(url, {
            next: { revalidate: 0 },
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (isCodeforcesError(data)) {
            return {
                success: false,
                error: data.comment
                    .replace(/handles: /, '')
                    .replace(/contestId: /, '')
            };
        }

        if (!response.ok || data.status !== "OK" || !data.result) {
            return {
                success: false,
                error: 'Invalid response from Codeforces API'
            };
        }

        return {
            success: true,
            data: data as CodeforcesStandingsResponse
        };
    } catch (error) {
        return {
            success: false,
            error: `Failed to fetch standings: ${error instanceof Error ? error.message : String(error)}`
        };
    }
});

function processUserResults(
    handle: string,
    standings: CodeforcesStandingsResponse
): ProcessedResult {
    try {
        const result = standings.result!;

        const contestRow = result.rows.find(
            row => (row.party.participantType === "CONTESTANT" || 
                   row.party.participantType === "OUT_OF_COMPETITION") &&
                row.party.members.some(m => m.handle.toLowerCase() === handle.toLowerCase())
        );

        const practiceRow = result.rows.find(
            row => row.party.participantType === "PRACTICE" &&
                row.party.members.some(m => m.handle.toLowerCase() === handle.toLowerCase())
        );

        if (!contestRow && !practiceRow) {
            return { solveCount: 0, upsolveCount: 0, absent: true };
        }

        const solveCount = contestRow?.problemResults.filter(
            problem => problem.points > 0
        ).length ?? 0;

        const contestSolvedProblems = new Set(
            contestRow?.problemResults
                .map((problem, index) => problem.points > 0 ? index : -1)
                .filter(index => index !== -1) ?? []
        );

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
    singleUserId?: string
): Promise<UpdateResultsResponse> {
    try {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: {
                eventLink: true,
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

        if (!event?.eventLink) {
            return { success: false, error: "Event link not found" };
        }

        // Extract contest ID from event link
        const contestIdMatch = event.eventLink.match(/contests\/(\d+)/);
        const contestId = contestIdMatch?.[1];

        if (!contestId) {
            return { success: false, error: "Invalid Codeforces contest URL" };
        }

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

        let filteredUsers = users;
        if (singleUserId) {
            filteredUsers = users.filter(user => user.id === singleUserId);
            if (filteredUsers.length === 0) {
                return { success: false, error: "User not found or no Codeforces handle set" };
            }
        }

        const standingsResult = await getContestStandings(
            contestId,
            filteredUsers.map(u => u.codeforcesHandle)
        );

        if (!standingsResult.success || !standingsResult.data) {
            return { success: false, error: standingsResult.error };
        }

        const processedResults: Record<string, ProcessedResult> = {};

        filteredUsers.forEach(user => {
            processedResults[user.codeforcesHandle] = processUserResults(
                user.codeforcesHandle,
                standingsResult.data!
            );
        });

        try {
            await prisma.$transaction(async (tx) => {
                await tx.solveStat.deleteMany({
                    where: { eventId }
                });

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
        } catch (dbError) {
            console.error("Database transaction error:", dbError);
            return {
                success: false,
                error: "Failed to update database records",
                data: processedResults
            };
        }

    } catch (error) {
        console.error("Update error:", error);
        return {
            success: false,
            error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}