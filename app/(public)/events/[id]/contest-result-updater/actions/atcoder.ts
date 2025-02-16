"use server";

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type {
    AtcoderContest,
    AtcoderSubmission,
    ProcessedUserResult,
    UpdateResultsResponse,
} from "../types/atcoder";

const ATCODER_API = {
    CONTESTS: "https://kenkoooo.com/atcoder/resources/contests.json",
    SUBMISSIONS: "https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions",
} as const;

const fetchWithRetry = async (url: string, retries = 3): Promise<Response> => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, { next: { revalidate: 0 } });
            if (response.ok) return response;
        } catch {
            if (i === retries - 1) throw new Error(`Failed to fetch ${url}`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
    throw new Error(`Failed to fetch ${url} after ${retries} retries`);
};

const getContests = cache(async (): Promise<AtcoderContest[]> => {
    const response = await fetchWithRetry(ATCODER_API.CONTESTS);
    return response.json();
});

const getSubmissions = cache(async (username: string, fromSecond: number): Promise<AtcoderSubmission[]> => {
    const url = `${ATCODER_API.SUBMISSIONS}?user=${username}&from_second=${fromSecond}`;
    const response = await fetchWithRetry(url);
    return response.json();
});

export async function* processAtcoderResults(
    eventId: bigint,
    contestId: string,
    emitProgress: boolean = true
): AsyncGenerator<ProcessedUserResult, void, undefined> {
    try {
        const contests = await getContests();
        const contestInfo = contests.find(c => c.id === contestId);
        
        if (!contestInfo) {
            throw new Error("Contest not found");
        }

        const users = await prisma.user.findMany({
            where: {
                atcoderHandle: { not: null },
                rankListUsers: {
                    some: {
                        rankList: {
                            eventRankLists: {
                                some: {
                                    event: { id: eventId }
                                }
                            }
                        }
                    }
                }
            },
            select: {
                id: true,
                name: true,
                atcoderHandle: true
            }
        });

        for (const user of users) {
            if (!user.atcoderHandle) continue;

            try {
                const submissions = await getSubmissions(
                    user.atcoderHandle,
                    contestInfo.start_epoch_second
                );

                const contestEnd = contestInfo.start_epoch_second + contestInfo.duration_second;
                const solvedProblems = new Set<string>();
                const upsolvedProblems = new Set<string>();
                let isPresent = false;

                for (const sub of submissions) {
                    if (sub.contest_id !== contestId) continue;

                    const submissionTime = sub.epoch_second;
                    
                    if (submissionTime >= contestInfo.start_epoch_second && 
                        submissionTime <= contestEnd) {
                        isPresent = true;
                        if (sub.result === "AC") {
                            solvedProblems.add(sub.problem_id);
                        }
                    } else if (submissionTime > contestEnd && 
                              sub.result === "AC" && 
                              !solvedProblems.has(sub.problem_id)) {
                        upsolvedProblems.add(sub.problem_id);
                    }
                }

                const result = {
                    username: user.name,
                    atcoderHandle: user.atcoderHandle,
                    solveCount: solvedProblems.size,
                    upsolveCount: upsolvedProblems.size,
                    isPresent
                };

                if (emitProgress) {
                    yield result;
                }

                // Update database
                await prisma.solveStat.upsert({
                    where: {
                        userId_eventId: {
                            userId: user.id,
                            eventId
                        }
                    },
                    create: {
                        userId: user.id,
                        eventId,
                        solveCount: BigInt(solvedProblems.size),
                        upsolveCount: BigInt(upsolvedProblems.size),
                        isPresent
                    },
                    update: {
                        solveCount: BigInt(solvedProblems.size),
                        upsolveCount: BigInt(upsolvedProblems.size),
                        isPresent
                    }
                });

            } catch (error) {
                const result = {
                    username: user.name,
                    atcoderHandle: user.atcoderHandle,
                    solveCount: 0,
                    upsolveCount: 0,
                    isPresent: false,
                    error: error instanceof Error ? error.message : String(error)
                };
                
                if (emitProgress) yield result;
            }
        }

        revalidatePath(`/events/${eventId}`);

    } catch (error) {
        throw new Error(
            `Failed to process results: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}

export async function updateAtcoderResults(
    eventId: bigint,
    contestId: string
): Promise<UpdateResultsResponse> {
    try {
        for await (const _ of processAtcoderResults(eventId, contestId, false)) {
            // Process without yielding progress
        }
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}
