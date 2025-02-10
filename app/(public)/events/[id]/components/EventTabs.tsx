"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AttendanceSection from "./AttendanceSection";
import SolveStatsSection from "./SolveStatsSection";
import { cn } from "@/lib/utils";

interface EventTabsProps {
  event: Event & {
    eventUsers: Array<{
      user: {
        id: string;
        name: string;
        username: string;
        image: string | null;
      };
    }>;
    solveStats: Array<{
      user: {
        id: string;
        name: string;
        username: string;
        image: string | null;
      };
    } & SolveStat>;
  };
  hasAttendance: boolean;
  currentUser: { id: string; name: string } | null;
  currentUserName?: string;
  userSolveStat: SolveStat | null;
  defaultTab?: "attendance" | "solve-stats";
}

export default function EventTabs({
  event,
  hasAttendance,
  currentUser,
  currentUserName,
  userSolveStat,
  defaultTab = "solve-stats",
}: EventTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-2">
        <TabsList className="grid w-full grid-cols-2 h-14 rounded-xl bg-gray-100 dark:bg-gray-900 p-1">
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
      
      <TabsContent value="solve-stats" className="mt-6">
        <SolveStatsSection
          solveStats={event.solveStats}
          userSolveStat={userSolveStat}
          currentUserName={currentUserName}
        />
      </TabsContent>
    </Tabs>
  );
}