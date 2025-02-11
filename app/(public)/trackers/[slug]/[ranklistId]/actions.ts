'use server';

import { prisma } from "@/lib/prisma";
import { TrackerWithRankLists, RankListWithUsers, SolveStatWithEvent } from "./types";
import { Status } from "@prisma/client";

export async function getTrackerDetails(slug: string, ranklistId: string) {
  try {
    const tracker = await prisma.tracker.findFirst({
      where: {
        slug: slug,
        status: Status.published,
      },
      include: {
        rankLists: {
          orderBy: {
            createdAt: 'desc'
          },
        },
      },
    });

    if (!tracker) {
      return { error: 'Tracker not found' };
    }

    const rankList = await prisma.rankList.findFirst({
      where: {
        id: BigInt(ranklistId),
        trackerId: tracker.id,
      },
      include: {
        rankListUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
                maxCfRating: true,
                codeforcesHandle: true,
              },
            },
          },
          orderBy: {
            score: 'desc',
          },
        },
        eventRankLists: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!rankList) {
      return { error: 'Ranklist not found' };
    }

    return { tracker, rankList };
  } catch (error) {
    console.error('Error fetching tracker details:', error);
    return { error: 'Failed to load tracker details' };
  }
}

export async function getUserSolveStats(userId: string, eventIds: bigint[]) {
  try {
    const solveStats = await prisma.solveStat.findMany({
      where: {
        userId: userId,
        eventId: {
          in: eventIds,
        },
      },
      include: {
        event: true,
      },
      orderBy: {
        event: {
          startingAt: 'desc',
        },
      },
    });

    return { solveStats };
  } catch (error) {
    console.error('Error fetching solve stats:', error);
    return { error: 'Failed to load solve stats' };
  }
}