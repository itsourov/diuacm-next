"use client";

import { Event, SolveStat } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  userSolveStat: (SolveStat & {
    user: {
      id: string;
      name: string;
      username: string;
      image: string | null;
    };
  }) | null;
  defaultTab?: "attendance" | "solve-stats";
  className?: string;
}

export default function EventTabs({
  event,
  hasAttendance,
  currentUser,
  currentUserName,
  userSolveStat,
  defaultTab = "solve-stats",
  className,
}: EventTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className={className}>
      <TabsList className="grid w-full grid-cols-2">
        {event.openForAttendance && (
          <TabsTrigger 
            value="attendance"
            className={cn(
              "data-[state=active]:bg-gray-900 data-[state=active]:text-white",
              "dark:data-[state=active]:bg-gray-100 dark:data-[state=active]:text-gray-900"
            )}
          >
            Attendance
          </TabsTrigger>
        )}
        <TabsTrigger 
          value="solve-stats"
          className={cn(
            "data-[state=active]:bg-gray-900 data-[state=active]:text-white",
            "dark:data-[state=active]:bg-gray-100 dark:data-[state=active]:text-gray-900"
          )}
        >
          Solve Stats
        </TabsTrigger>
      </TabsList>
      
      {event.openForAttendance && (
        <TabsContent value="attendance">
          <AttendanceSection
            event={event}
            hasAttendance={hasAttendance}
            currentUser={currentUser}
          />
        </TabsContent>
      )}
      
      <TabsContent value="solve-stats">
        <SolveStatsSection
          solveStats={event.solveStats}
          userSolveStat={userSolveStat}
          currentUserName={currentUserName}
        />
      </TabsContent>
    </Tabs>
  );
}