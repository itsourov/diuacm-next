"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { RankListWithRelations, CurrentUser } from "../types";
import RankListSection from "./RankListSection";
import EventListSection from "./EventListSection";

interface TrackerTabsProps {
  currentRankList: RankListWithRelations;
  currentUser: CurrentUser | null;
  isSubscribed: boolean;
  rankListId: string;
}

export default function TrackerTabs({
  currentRankList,
  currentUser,
  isSubscribed,
  rankListId,
}: TrackerTabsProps) {
  return (
    <Tabs defaultValue="ranklist" className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-2">
        <TabsList className="grid w-full grid-cols-2 h-14 rounded-xl bg-gray-100 dark:bg-gray-900 p-1">
          <TabsTrigger
            value="ranklist"
            className={cn(
              "rounded-lg text-base font-medium h-12",
              "data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800",
              "data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400",
              "data-[state=active]:shadow-sm",
              "transition-all duration-200"
            )}
          >
            Ranklist
          </TabsTrigger>
          <TabsTrigger
            value="events"
            className={cn(
              "rounded-lg text-base font-medium h-12",
              "data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800",
              "data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400",
              "data-[state=active]:shadow-sm",
              "transition-all duration-200"
            )}
          >
            Connected Events
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="ranklist" className="mt-6">
        <RankListSection
          rankListId={rankListId}
          currentUser={currentUser}
          isSubscribed={isSubscribed}
        />
      </TabsContent>

      <TabsContent value="events" className="mt-6">
        <EventListSection events={currentRankList.eventRankLists} />
      </TabsContent>
    </Tabs>
  );
}