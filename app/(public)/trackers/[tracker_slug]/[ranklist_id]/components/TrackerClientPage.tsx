"use client";

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import TrackerTabs from "./TrackerTabs";
import TrackerHeroSection from "./TrackerHeroSection";
import { RankListWithRelations, TrackerWithRelations, CurrentUser } from "../types";

interface TrackerClientPageProps {
    tracker: TrackerWithRelations;
    initialRankList: RankListWithRelations;
    currentUser: CurrentUser | null;
    isSubscribed: boolean;
    rankListId: string;
}

export default function TrackerClientPage({
    tracker,
    initialRankList,
    currentUser,
    isSubscribed,
    rankListId,
}: TrackerClientPageProps) {
    const [currentRankList, setCurrentRankList] = useState<RankListWithRelations>(initialRankList);
    const router = useRouter();

    const handleRankListChange = useCallback(async (newRankListId: string) => {
        try {
            const newRankList = tracker.rankLists.find(
                (rl) => rl.id.toString() === newRankListId
            );
            if (newRankList) {
                setCurrentRankList(newRankList as RankListWithRelations);
                router.replace(`/trackers/${tracker.slug}/${newRankListId}`, { scroll: false });
            }
        } catch (error) {
            console.error("Error changing ranklist:", error);
        }
    }, [tracker, router]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <TrackerHeroSection
                tracker={tracker}
                currentRankList={currentRankList}
                rankLists={tracker.rankLists}
                onRankListChange={handleRankListChange}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <TrackerTabs
                    currentRankList={currentRankList}
                    currentUser={currentUser}
                    isSubscribed={isSubscribed}
                    rankListId={rankListId}
                />
            </div>
        </div>
    );
}
