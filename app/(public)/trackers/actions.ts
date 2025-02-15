'use server';

import { prisma } from "@/lib/prisma";
import { TrackerWithRankLists } from "./types";

export async function getTrackers(): Promise<TrackerWithRankLists[]> {
    try {
        const trackers = await prisma.tracker.findMany({
            where: {
                status: 'published'
            },
            include: {
                rankLists: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return trackers;
    } catch (error) {
        console.error('Error fetching trackers:', error);
        throw new Error('Failed to fetch trackers');
    }
}
