import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import GridViewClient from "./GridViewClient";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{
    tracker_slug: string;
    ranklist_id: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;

  const tracker = await prisma.tracker.findFirst({
    where: { slug: resolvedParams.tracker_slug },
    include: {
      rankLists: {
        where: { id: BigInt(resolvedParams.ranklist_id) },
      },
    },
  });

  if (!tracker || !tracker.rankLists[0]) notFound();

  return {
    title: `Grid View - ${tracker.rankLists[0].title} - ${tracker.title}`,
  };
}

export default async function GridPage({ params, searchParams }: PageProps) {
  const [resolvedParams] = await Promise.all([params, searchParams]);

  const rankList = await prisma.rankList.findUnique({
    where: { id: BigInt(resolvedParams.ranklist_id) },
    include: {
      eventRankLists: {
        include: {
          event: true,
        },
        orderBy: {
          event: {
            startingAt: "desc",
          },
        },
      },
      rankListUsers: {
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
      },
    },
  });

  if (!rankList) notFound();

  // Get all event IDs
  const eventIds = rankList.eventRankLists.map((erl) => erl.eventId);

  // Get all user IDs
  const userIds = rankList.rankListUsers.map((rlu) => rlu.userId);

  // Get solve stats for all users and events
  const solveStats = await prisma.solveStat.findMany({
    where: {
      userId: { in: userIds },
      eventId: { in: eventIds },
    },
    select: {
      userId: true,
      eventId: true,
      solveCount: true,
      upsolveCount: true,
      isPresent: true, // Add this field
    },
  });

  // Create grid data
  const gridData = {
    events: rankList.eventRankLists.map((erl) => ({
      ...erl.event,
      weight: erl.weight,
    })),
    users: rankList.rankListUsers.map((user) => ({
      ...user,
      solveStats: solveStats.filter((stat) => stat.userId === user.userId),
    })),
    weightOfUpsolve: rankList.weightOfUpsolve,
  };

  return (
    <GridViewClient
      data={gridData}
      title={rankList.title} // Pass the title
    />
  );
}
