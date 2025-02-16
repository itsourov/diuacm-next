import { processAtcoderResults } from "@/app/(public)/events/[id]/contest-result-updater/actions/atcoder";
import { ProcessedUserResult } from "@/app/(public)/events/[id]/contest-result-updater/types/atcoder";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { searchParams } = new URL(request.url);
    const contestId = searchParams.get('contestId');

    if (!contestId) {
        return new Response(
            JSON.stringify({ type: 'error', error: 'Contest ID is required' }), 
            { status: 400 }
        );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            try {
                const results: ProcessedUserResult[] = [];
                let processedUsers = 0;
                let totalUsers = 0;
                let firstResult = true;

                for await (const result of processAtcoderResults(BigInt(params.id), contestId)) {
                    results.push(result);
                    processedUsers++;

                    if (firstResult) {
                        // Get total users on first result
                        const users = await prisma.user.count({
                            where: {
                                atcoderHandle: { not: null },
                                rankListUsers: {
                                    some: {
                                        rankList: {
                                            eventRankLists: {
                                                some: {
                                                    event: { id: BigInt(params.id) }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        });
                        totalUsers = users;
                        firstResult = false;
                    }

                    // Send progress update
                    const progressEvent = {
                        type: 'progress',
                        userResults: [result],
                        totalUsers,
                        processedUsers
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(progressEvent)}\n\n`));
                }

                let totalSolved = 0;
                let totalUpsolved = 0;
                let presentUsers = 0;

                for (const result of results) {
                    totalSolved += result.solveCount;
                    totalUpsolved += result.upsolveCount;
                    if (result.isPresent) presentUsers++;
                }

                // Send completion event
                const completeEvent = {
                    type: 'complete',
                    totalStats: {
                        totalUsers: results.length,
                        presentUsers,
                        totalSolved,
                        totalUpsolved
                    }
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(completeEvent)}\n\n`));
                controller.close();
            } catch (error) {
                const errorEvent = {
                    type: 'error',
                    error: error instanceof Error ? error.message : String(error)
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
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
