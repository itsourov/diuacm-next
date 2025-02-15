"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleRankListSubscription(rankListId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, message: "You must be logged in" };
    }

    const existingSubscription = await prisma.rankListUser.findFirst({
      where: {
        userId: userId,
        rankListId: BigInt(rankListId),
      },
    });

    if (existingSubscription) {
      await prisma.rankListUser.delete({
        where: { id: existingSubscription.id },
      });
    } else {
      // Now we know userId is definitely defined
      await prisma.rankListUser.create({
        data: {
          userId: userId,
          rankListId: BigInt(rankListId),
        },
      });
    }

    revalidatePath("/trackers/[tracker_slug]/[ranklist_id]", 'page');
    return { success: true };
  } catch (error) {
    console.error("Error toggling subscription:", error);
    return { success: false, message: "Failed to update subscription" };
  }
}

export async function loadMoreUsers(
  rankListId: string,
  skip: number,
  take: number
) {
  try {
    const users = await prisma.rankListUser.findMany({
      where: { rankListId: BigInt(rankListId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: { score: "desc" },
      skip,
      take,
    });

    return { success: true, users };
  } catch (error) {
    console.error("Error loading users:", error);
    return { success: false, message: "Failed to load users" };
  }
}

export async function getAllRankListUsers(rankListId: string) {
  try {
    const users = await prisma.rankListUser.findMany({
      where: { rankListId: BigInt(rankListId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: { score: "desc" },
    });

    return { success: true, users };
  } catch (error) {
    console.error("Error loading users:", error);
    return { success: false, message: "Failed to load users" };
  }
}

export async function getUserSolveStats(userId: string, rankListId: string) {
  try {
    const rankList = await prisma.rankList.findUnique({
      where: { id: BigInt(rankListId) },
      include: {
        eventRankLists: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!rankList) {
      return { success: false, message: "Ranklist not found" };
    }

    const solveStats = await prisma.solveStat.findMany({
      where: {
        userId,
        eventId: {
          in: rankList.eventRankLists.map((erl) => erl.eventId),
        },
      },
      include: {
        event: true,
      },
      orderBy: {
        event: {
          startingAt: 'desc'
        }
      },
    });

    const solveStatsWithPoints = solveStats.map((stat) => {
      const eventRankList = rankList.eventRankLists.find(
        (erl) => erl.eventId === stat.eventId
      );
      const weight = eventRankList?.weight || 0;
      const contestPoints = Number(stat.solveCount) * weight;
      const upsolvePoints =
        Number(stat.upsolveCount) * weight * rankList.weightOfUpsolve;

      return {
        ...stat,
        eventWeight: weight,
        points: {
          contestPoints,
          upsolvePoints,
          totalPoints: contestPoints + upsolvePoints,
        },
      };
    });

    const totalStats = solveStatsWithPoints.reduce(
      (acc, stat) => ({
        totalEvents: acc.totalEvents + 1,
        totalSolves: acc.totalSolves + Number(stat.solveCount),
        totalUpsolves: acc.totalUpsolves + Number(stat.upsolveCount),
        totalPoints: acc.totalPoints + stat.points.totalPoints,
      }),
      { totalEvents: 0, totalSolves: 0, totalUpsolves: 0, totalPoints: 0 }
    );

    return {
      success: true,
      solveStats: solveStatsWithPoints,
      totalStats,
    };
  } catch (error) {
    console.error("Error loading solve stats:", error);
    return { success: false, message: "Failed to load solve stats" };
  }
}

export async function recalculateRankListScores(rankListId: string) {
  try {
    // Get the rank list with its events and weightOfUpsolve
    const rankList = await prisma.rankList.findUnique({
      where: { id: BigInt(rankListId) },
      include: {
        eventRankLists: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!rankList) {
      return { success: false, message: "Ranklist not found" };
    }

    // Get all users in the ranklist
    const rankListUsers = await prisma.rankListUser.findMany({
      where: { rankListId: BigInt(rankListId) },
    });

    // Calculate scores for each user
    for (const user of rankListUsers) {
      let totalScore = 0;

      // Get solve stats for all events
      const solveStats = await prisma.solveStat.findMany({
        where: {
          userId: user.userId,
          eventId: {
            in: rankList.eventRankLists.map((erl) => erl.eventId),
          },
        },
      });

      // Calculate score for each event
      for (const stat of solveStats) {
        const eventRankList = rankList.eventRankLists.find(
          (erl) => erl.eventId === stat.eventId
        );
        if (eventRankList) {
          const contestScore = Number(stat.solveCount) * eventRankList.weight;
          const upsolveScore =
            Number(stat.upsolveCount) *
            eventRankList.weight *
            rankList.weightOfUpsolve;
          totalScore += contestScore + upsolveScore;
        }
      }

      // Update user's score
      await prisma.rankListUser.update({
        where: { id: user.id },
        data: { score: totalScore },
      });
    }

    revalidatePath("/trackers/[tracker_slug]/[ranklist_id]", 'page');
    return { success: true, message: "Scores recalculated successfully" };
  } catch (error) {
    console.error("Error recalculating scores:", error);
    return { success: false, message: "Failed to recalculate scores" };
  }
}
