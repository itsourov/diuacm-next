"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { recalculateRankListScores } from '@/app/(public)/trackers/[tracker_slug]/[ranklist_id]/actions';
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

    // Initialize user stats (same as before)
    Object.entries(data.participants).forEach(([, participant]) => {
        const username = participant[0];
        processed[username] = {
            solveCount: 0,
            upSolveCount: 0,
            absent: true,
            solved: Object.fromEntries(Array(50).fill(0).map((_, i) => [i, 0]))
        };
    });

    // First pass: Process in-time submissions
    if (Array.isArray(data.submissions)) {
        data.submissions.forEach(([participantId, problemIndex, isAccepted, timestamp]) => {
            const participant = data.participants[participantId.toString()];
            if (!participant) return;

            const username = participant[0];
            const userStats = processed[username];
            if (!userStats) return;

            if (timestamp > timeLimit) return;
            userStats.absent = false;

            if (isAccepted === 1) {
                if (!userStats.solved[problemIndex]) {
                    userStats.solveCount += 1;
                    userStats.solved[problemIndex] = 1;
                }
            }
        });
    }

    // Second pass: Process upsolve submissions
    if (Array.isArray(data.submissions)) {
        data.submissions.forEach(([participantId, problemIndex, isAccepted, timestamp]) => {
            const participant = data.participants[participantId.toString()];
            if (!participant) return;

            const username = participant[0];
            const userStats = processed[username];
            if (!userStats) return;

            if (isAccepted === 1 && timestamp > timeLimit) {
                if (!userStats.solved[problemIndex]) {
                    userStats.upSolveCount += 1;
                    userStats.solved[problemIndex] = 1;
                }
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
    sessionId
}: UpdateVjudgeResultsParams): Promise<UpdateResultsResponse> {
    try {
        log(`Starting update for event ${eventId}`);

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: {
                eventLink: true,
                strictAttendance: true,
                eventUsers: {
                    select: {
                        userId: true
                    }
                },
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

        if (!event?.eventLink) {
            return { success: false, error: "Event not found or missing event link" };
        }

        const contestIdMatch = event.eventLink.match(/contest\/(\d+)/);
        const contestId = contestIdMatch?.[1];

        if (!contestId) {
            return { success: false, error: "Invalid Vjudge contest URL" };
        }

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

        // Check if response is valid JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            if (sessionId)
                return { success: false, error: "Invalid response format from vjudge. check if the vjudge account have access to this contest" };
            else
                return { success: false, error: "Invalid response format from vjudge. maybe this contest is only accessable with authentication." };
        }


        const data = await response.json();

        // Accept data if it has the required minimal structure
        if (!data || typeof data !== 'object' || typeof data.length !== 'number' || !data.participants) {
            return { success: false, error: "Invalid contest data format" };
        }

        const processedData = processVjudgeData(data as VjudgeContestData);

        // Helper function to chunk array
        const chunkArray = <T>(array: T[], size: number): T[][] => {
            return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
                array.slice(i * size, i * size + size)
            );
        };

        // Delete existing solve stats outside transaction
        await prisma.solveStat.deleteMany({
            where: { eventId: BigInt(eventId) }
        });

        // Create a Set of participating user IDs for quick lookup
        const participatingUserIds = new Set(
            event.strictAttendance ? event.eventUsers.map(eu => eu.userId) : []
        );

        // Process users in chunks of 10
        const userChunks = chunkArray(users, 10);

        for (const chunk of userChunks) {
            await prisma.$transaction(
                async (tx) => {
                    await Promise.all(chunk.map(user => {
                        const stats = user.vjudgeHandle ? processedData[user.vjudgeHandle] : null;
                        
                        let finalSolveCount = BigInt(stats?.solveCount ?? 0);
                        let finalUpsolveCount = BigInt(stats?.upSolveCount ?? 0);
                        
                        // If strict attendance is enabled and user is not in eventUsers
                        if (event.strictAttendance && !participatingUserIds.has(user.id)) {
                            finalUpsolveCount += finalSolveCount; // Move solves to upsolves
                            finalSolveCount = BigInt(0);
                        }

                        return tx.solveStat.create({
                            data: {
                                userId: user.id,
                                eventId: BigInt(eventId),
                                solveCount: finalSolveCount,
                                upsolveCount: finalUpsolveCount,
                                // Mark as absent if strict attendance is enabled and user not in eventUsers
                                isPresent: event.strictAttendance ? 
                                    participatingUserIds.has(user.id) : 
                                    !(stats?.absent ?? true),
                            }
                        });
                    }));
                },
                {
                    timeout: 10000 // 10 second timeout
                }
            );
        }

        // Recalculate scores for all associated ranklists
        const recalculationPromises = event.eventRankLists.map(erl =>
            recalculateRankListScores(erl.rankListId.toString())
        );
        await Promise.all(recalculationPromises);

        log("Update completed successfully");
        revalidatePath(`/events/${eventId}`);

        return { success: true, data: processedData };
    } catch (error) {
        log(`Error: ${error instanceof Error ? error.message : String(error)}`);
        return { success: false, error: "Failed to update results. " };
    }
}