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

    revalidatePath("/trackers/[tracker_slug]/[ranklist_id]");
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
    });

    return { success: true, solveStats };
  } catch (error) {
    console.error("Error loading solve stats:", error);
    return { success: false, message: "Failed to load solve stats" };
  }
}
