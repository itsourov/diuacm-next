import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Metadata } from "next";
import TrackerClientPage from "./components/TrackerClientPage";

interface PageProps {
    params: Promise<{
        tracker_slug: string;
        ranklist_id: string;
    }>;
}

async function getTrackerData(slug: string, rankListId: string) {
    try {
        const tracker = await prisma.tracker.findFirst({
            where: {
                slug: slug,
            },
            include: {
                rankLists: {
                    include: {
                        eventRankLists: {
                            include: {
                                event: true,
                            },
                        },
                    },
                },
            },
        });

        if (!tracker) notFound();

        const currentRankList = tracker.rankLists.find(
            (rl) => rl.id === BigInt(rankListId)
        );

        if (!currentRankList) notFound();

        return {
            tracker,
            currentRankList,
        };
    } catch (error) {
        console.error("Error fetching tracker data:", error);
        throw error;
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const { tracker, currentRankList } = await getTrackerData(
        resolvedParams.tracker_slug,
        resolvedParams.ranklist_id
    );

    return {
        title: `${currentRankList.title} - ${tracker.title}`,
        description: tracker.description,
    };
}

export default async function TrackerPage({ params }: PageProps) {
    const [resolvedParams, session] = await Promise.all([
        params,
        auth()
    ]);

    const { tracker, currentRankList } = await getTrackerData(
        resolvedParams.tracker_slug,
        resolvedParams.ranklist_id
    );

    const currentUser = session?.user?.id && session.user.name
        ? {
            id: session.user.id,
            name: session.user.name,
        }
        : null;

    const userSubscription = currentUser
        ? await prisma.rankListUser.findFirst({
            where: {
                userId: currentUser.id,
                rankListId: currentRankList.id,
            },
        })
        : null;

    return (
        <TrackerClientPage
            tracker={tracker}
            initialRankList={currentRankList}
            currentUser={currentUser}
            isSubscribed={!!userSubscription}
            rankListId={resolvedParams.ranklist_id}
        />
    );
}