"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AttendanceSection from "./AttendanceSection";
import SolveStatsSection from "./SolveStatsSection";
import RankListsSection from "./RankListsSection";
import { cn } from "@/lib/utils";
import { Event, SolveStat } from "@prisma/client";
import { useSearchParams, useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  username: string;
  studentId: string | null;
  image: string | null;
}

interface EventWithRelations extends Event {
  eventUsers: Array<{
    user: User;
  }>;
  solveStats: Array<SolveStat & {
    user: User;
  }>;
  eventRankLists: Array<{
    id: bigint;
    weight: number;
    rankList: {
      id: bigint;
      title: string;
      session: string;
      description: string | null;
      weightOfUpsolve: number;
      tracker: {
        slug: string;
      };
    };
  }>;
}

interface EventTabsProps {
  event: EventWithRelations;
  hasAttendance: boolean;
  currentUser: { id: string; name: string } | null;
  currentUserName?: string;
  userSolveStat: (SolveStat & { user: User }) | null;
  defaultTab?: "attendance" | "solve-stats" | "ranklists";
}

export default function EventTabs({
  event,
  hasAttendance,
  currentUser,
  currentUserName,
  userSolveStat,
  defaultTab = "solve-stats",
}: EventTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get tab from URL or use default
  const urlTab = searchParams.get('tab');
  const isValidTab = (tab: string | null): tab is "attendance" | "solve-stats" | "ranklists" => {
    return tab === "attendance" || tab === "solve-stats" || tab === "ranklists";
  };

  // Determine effective default tab based on URL, event type and attendance status
  const effectiveDefaultTab = isValidTab(urlTab) ? urlTab :
    (event.type === 'contest' 
      ? defaultTab 
      : (event.openForAttendance ? "attendance" : "solve-stats"));

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    router.replace(url.toString());
  };

  return (
    <Tabs 
      defaultValue={effectiveDefaultTab} 
      className="space-y-8"
      onValueChange={handleTabChange}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-2">
        <TabsList 
          className={cn(
            "grid w-full h-14 rounded-xl bg-gray-100 dark:bg-gray-900 p-1",
            event.type === 'contest' 
              ? "grid-cols-3" 
              : (event.openForAttendance ? "grid-cols-1" : "hidden")
          )}
        >
          {event.openForAttendance && (
            <TabsTrigger
              value="attendance"
              className={cn(
                "rounded-lg text-base font-medium h-12",
                "data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800",
                "data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400",
                "data-[state=active]:shadow-sm",
                "transition-all duration-200"
              )}
            >
              Attendance
            </TabsTrigger>
          )}
          
          {event.type === 'contest' && (
            <>
              <TabsTrigger
                value="solve-stats"
                className={cn(
                  "rounded-lg text-base font-medium h-12",
                  "data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800",
                  "data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400",
                  "data-[state=active]:shadow-sm",
                  "transition-all duration-200"
                )}
              >
                Solve Stats
              </TabsTrigger>
              <TabsTrigger
                value="ranklists"
                className={cn(
                  "rounded-lg text-base font-medium h-12",
                  "data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800",
                  "data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400",
                  "data-[state=active]:shadow-sm",
                  "transition-all duration-200"
                )}
              >
                Ranklists
              </TabsTrigger>
            </>
          )}
        </TabsList>
      </div>

      {event.openForAttendance && (
        <TabsContent value="attendance" className="mt-6">
          <AttendanceSection
            event={event}
            hasAttendance={hasAttendance}
            currentUser={currentUser}
          />
        </TabsContent>
      )}

      {event.type === 'contest' && (
        <>
          <TabsContent value="solve-stats" className="mt-6">
            <SolveStatsSection
              solveStats={event.solveStats}
              userSolveStat={userSolveStat}
              currentUserName={currentUserName}
            />
          </TabsContent>

          <TabsContent value="ranklists" className="mt-6">
            <RankListsSection eventRankLists={event.eventRankLists} />
          </TabsContent>
        </>
      )}
    </Tabs>
  );
}