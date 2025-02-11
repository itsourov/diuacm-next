"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type {
    VjudgeContestData,
    ProcessedContestData,
    UpdateResultsResponse,
    ValidateSessionResponse,
    UpdateVjudgeResultsParams,
} from "../types/vjudge";

const VJUDGE_API = {
    BASE_URL: "https://vjudge.net",
    ENDPOINTS: {
        USER_UPDATE: "/user/update",
        CONTEST_RANK: "/contest/rank/single"
    }
} as const;

function getCurrentDateTime(): string {
    return new Date().toISOString()
        .replace('T', ' ')
        .slice(0, 19);
}

function log(message: string): void {
    console.log(`[${getCurrentDateTime()}] [itsourov] ${message}`);
}

function processVjudgeData(data: VjudgeContestData): ProcessedContestData {
    const timeLimit = data.length / 1000;
    const processed: ProcessedContestData = {};

    // Initialize user stats
    Object.entries(data.participants).forEach(([, participant]) => {
        const username = participant[0];
        processed[username] = {
            solveCount: 0,
            upSolveCount: 0,
            absent: true,
            solved: Object.fromEntries(Array(50).fill(0).map((_, i) => [i, 0]))
        };
    });

    // Process submissions if they exist
    if (Array.isArray(data.submissions)) {
        data.submissions.forEach(([participantId, problemIndex, isAccepted, timestamp]) => {
            const participant = data.participants[participantId.toString()];
            if (!participant) return;

            const username = participant[0];
            const userStats = processed[username];
            if (!userStats) return;

            userStats.absent = false;

            if (isAccepted === 1 && !userStats.solved[problemIndex]) {
                if (timestamp <= timeLimit) {
                    userStats.solveCount += 1;
                } else {
                    userStats.upSolveCount += 1;
                }
                userStats.solved[problemIndex] = 1;
            }
        });
    }

    return processed;
}

export async function validateVjudgeSession(sessionId: string): Promise<ValidateSessionResponse> {
    try {
        if (!sessionId.includes("|")) {
            return { success: false, error: "Invalid session ID format" };
        }

        const response = await fetch(`${VJUDGE_API.BASE_URL}${VJUDGE_API.ENDPOINTS.USER_UPDATE}`, {
            headers: {
                "accept": "*/*",
                "cookie": `JSESSIONlD=${sessionId}`,
                "x-requested-with": "XMLHttpRequest"
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            return { success: false, error: "Invalid session" };
        }
        const data = await response.json();
        if (!data.username) {
            return { success: false, error: "Invalid session" };
        }


        return { success: true, username: data.username };
    } catch (error) {
        log(`Session validation error: ${error instanceof Error ? error.message : String(error)}`);
        return { success: false, error: "Failed to validate session" };
    }
}

export async function updateVjudgeResults({
    eventId,
    contestId,
    sessionId
}: UpdateVjudgeResultsParams): Promise<UpdateResultsResponse> {
    try {
        log(`Starting update for contest ${contestId}`);

        // Updated query to match new schema structure
        const event = await prisma.event.findUnique({
            where: { id: BigInt(eventId) },
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
                                                vjudgeHandle: true,
                                                username: true
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

        if (!event || event.eventRankLists.length === 0) {
            return { success: false, error: "Event or ranklists not found" };
        }

        // Get unique users from all ranklists associated with the event
        const users = event.eventRankLists
            .flatMap(erl => erl.rankList.rankListUsers)
            .map(rlu => rlu.user)
            .filter((user): user is typeof user & { vjudgeHandle: string } =>
                Boolean(user.vjudgeHandle)
            )
            .filter((user, index, self) =>
                index === self.findIndex(u => u.id === user.id)
            );

        if (users.length === 0) {
            return {
                success: false,
                error: "No users with Vjudge handles found in the ranklists"
            };
        }

        const headers: Record<string, string> = {
            "accept": "*/*",
            "User-Agent": "Mozilla/5.0",
            "x-requested-with": "XMLHttpRequest"
        };

        if (sessionId) {
            headers.cookie = `JSESSIONlD=${sessionId}`;
        }

        const response = await fetch(
            `${VJUDGE_API.BASE_URL}${VJUDGE_API.ENDPOINTS.CONTEST_RANK}/${contestId}`,
            {
                headers,
                cache: 'no-store'
            }
        );

        if (!response.ok) {
            return {
                success: false,
                error: sessionId ? "Failed to fetch data" : "AUTH_REQUIRED"
            };
        }

        const data = await response.json();

        // Accept data if it has the required minimal structure
        if (!data || typeof data !== 'object' || typeof data.length !== 'number' || !data.participants) {
            return { success: false, error: "Invalid contest data format" };
        }

        const processedData = processVjudgeData(data as VjudgeContestData);

        // Updated transaction to use new schema
        await prisma.$transaction(async (tx) => {
            // Delete existing solve stats for this event
            await tx.solveStat.deleteMany({
                where: { eventId: BigInt(eventId) }
            });

            // Create new solve stats
            await Promise.all(users.map(user => {
                const stats = user.vjudgeHandle ? processedData[user.vjudgeHandle] : null;

                return tx.solveStat.create({
                    data: {
                        userId: user.id,
                        eventId: BigInt(eventId),
                        solveCount: BigInt(stats?.solveCount ?? 0),
                        upsolveCount: BigInt(stats?.upSolveCount ?? 0),
                        isPresent: !(stats?.absent ?? true),
                    }
                });
            }));
        });

        log("Update completed successfully");
        revalidatePath(`/events/${eventId}`);

        return { success: true, data: processedData };
    } catch (error) {
        log(`Error: ${error instanceof Error ? error.message : String(error)}`);
        return { success: false, error: "Failed to update results" };
    }
}