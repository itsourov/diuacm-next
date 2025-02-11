import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Metadata } from "next";
import TrackerTabs from "./components/TrackerTabs";
import TrackerHeroSection from "./components/TrackerHeroSection";
import { CurrentUser } from "./types";

interface PageProps {
    params: {
        tracker_slug: string;
        ranklist_id: string;
    };
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
    const { tracker, currentRankList } = await getTrackerData(
        params.tracker_slug,
        params.ranklist_id
    );

    return {
        title: `${currentRankList.title} - ${tracker.title}`,
        description: tracker.description,
    };
}

export default async function TrackerPage({ params }: PageProps) {
    const session = await auth();
    const { tracker, currentRankList } = await getTrackerData(
        params.tracker_slug,
        params.ranklist_id
    );

    // Fix: Only create currentUser when we have both id and name
    const currentUser: CurrentUser | null = session?.user?.id && session.user.name
        ? {
            id: session.user.id,    // Now we know this is definitely a string
            name: session.user.name,
        }
        : null;

    // Check if current user is subscribed to this ranklist
    const userSubscription = currentUser
        ? await prisma.rankListUser.findFirst({
            where: {
                userId: currentUser.id,
                rankListId: currentRankList.id,
            },
        })
        : null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <TrackerHeroSection
                tracker={tracker}
                currentRankList={currentRankList}
                rankLists={tracker.rankLists}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <TrackerTabs
                    currentRankList={currentRankList}
                    currentUser={currentUser}
                    isSubscribed={!!userSubscription}
                    rankListId={params.ranklist_id}
                />
            </div>
        </div>
    );
}