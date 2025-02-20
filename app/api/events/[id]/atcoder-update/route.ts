import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { recalculateRankListScores } from "@/app/(public)/trackers/[tracker_slug]/[ranklist_id]/actions";
import type {
    AtcoderContest,
    AtcoderSubmission,
    ProcessedUserResult,
} from "@/app/(public)/events/[id]/contest-result-updater/types/atcoder";

const ATCODER_API = {
    CONTESTS: "https://kenkoooo.com/atcoder/resources/contests.json",
    SUBMISSIONS: "https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions",
} as const;

const fetchWithRetry = async (url: string, retries = 3): Promise<Response> => {
    let lastError: Error | undefined;

    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, { next: { revalidate: 0 } });
            if (response.ok) return response;
            lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }
    throw lastError ?? new Error(`Failed to fetch ${url} after ${retries} retries`);
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

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    const params = await context.params;
    const eventId = BigInt(params.id);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            try {
                // First, get the event to extract contest ID
                const event = await prisma.event.findUnique({
                    where: { id: eventId },
                    select: { eventLink: true }
                });

                if (!event?.eventLink) {
                    throw new Error("Event link not found");
                }

                // Extract contest ID from event link
                const contestIdMatch = event.eventLink.match(/contests\/([^/]+)/);
                const contestId = contestIdMatch?.[1];

                if (!contestId) {
                    throw new Error("Invalid AtCoder contest URL");
                }

                // Get contest info
                const contests = await getContests();
                const contestInfo = contests.find(c => c.id === contestId);
                
                if (!contestInfo) {
                    throw new Error("Contest not found in AtCoder API");
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

                const results: ProcessedUserResult[] = [];
                let processedUsers = 0;
                const totalUsers = users.length;

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

                        const result: ProcessedUserResult = {
                            username: user.name,
                            atcoderHandle: user.atcoderHandle,
                            solveCount: solvedProblems.size,
                            upsolveCount: upsolvedProblems.size,
                            isPresent
                        };

                        results.push(result);
                        processedUsers++;

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

                        // Send progress update
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                            type: 'progress',
                            userResults: [result],
                            totalUsers,
                            processedUsers
                        })}\n\n`));

                    } catch (error) {
                        const result: ProcessedUserResult = {
                            username: user.name,
                            atcoderHandle: user.atcoderHandle,
                            solveCount: 0,
                            upsolveCount: 0,
                            isPresent: false,
                            error: error instanceof Error ? error.message : String(error)
                        };
                        
                        results.push(result);
                        processedUsers++;

                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                            type: 'progress',
                            userResults: [result],
                            totalUsers,
                            processedUsers
                        })}\n\n`));
                    }
                }

                let totalSolved = 0;
                let totalUpsolved = 0;
                let presentUsers = 0;

                for (const result of results) {
                    totalSolved += result.solveCount;
                    totalUpsolved += result.upsolveCount;
                    if (result.isPresent) presentUsers++;
                }

                // Recalculate scores for all associated ranklists
                const eventRankLists = await prisma.eventRankList.findMany({
                    where: { eventId },
                    select: { rankListId: true }
                });

                for (const { rankListId } of eventRankLists) {
                    await recalculateRankListScores(rankListId.toString());
                }

                // Send completion event
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'complete',
                    totalStats: {
                        totalUsers: results.length,
                        presentUsers,
                        totalSolved,
                        totalUpsolved
                    }
                })}\n\n`));

                controller.close();
            } catch (error) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'error',
                    error: error instanceof Error ? error.message : String(error)
                })}\n\n`));
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
