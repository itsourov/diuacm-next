"use client";

// Remove unused imports
import { GridViewData } from "../types-grid";
import UserAvatar from "@/components/UserAvatar";
import { formatName, formatUsername, truncateText } from "../utils/format";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

interface GridViewClientProps {
  data: GridViewData;
  title: string;
}

export default function GridViewClient({ data, title }: GridViewClientProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const getSolveData = (userId: string, eventId: bigint): UserSolveData | null => {
    const user = data.users.find(u => u.user.id === userId);
    const solveStat = user?.solveStats.find(s => s.eventId === eventId);
    
    if (!solveStat) return null; // Return null if no solvestat exists

    const event = data.events.find(e => e.id === eventId);
    if (!event) return null;

    const contestPoints = Number(solveStat.solveCount) * event.weight;
    const upsolvePoints = Number(solveStat.upsolveCount) * event.weight * data.weightOfUpsolve;

    return {
      solveCount: Number(solveStat.solveCount),
      upsolveCount: Number(solveStat.upsolveCount),
      points: contestPoints + upsolvePoints,
      isPresent: solveStat.isPresent,
    };
  };

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Remove mobile navigation related code
  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolled(container.scrollLeft > 50);
      setIsHeaderVisible(container.scrollTop <= 100);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Modified Header */}
      <div className={cn(
        "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700",
        "sticky top-0 z-50",
        isHeaderVisible ? "h-16" : "hidden"
      )}>
        <div className="h-16 flex items-center px-6">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <div ref={tableContainerRef} className="h-full overflow-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead className="sticky top-0 z-30">
              <tr className="bg-white dark:bg-gray-800 shadow-sm">
                {/* User column header - Modified width transition */}
                <th className={cn(
                  "sticky left-0 z-40 bg-white dark:bg-gray-800 px-4 py-4 border-b border-r border-gray-200 dark:border-gray-700",
                  isScrolled ? "w-[60px]" : "w-[200px]"
                )}>
                  <div className="font-medium text-sm text-gray-900 dark:text-white md:block hidden">
                    User
                  </div>
                </th>
                {/* Points column header - Modified position */}
                <th className={cn(
                  "sticky z-40 bg-white dark:bg-gray-800 px-4 py-4 border-b border-r border-gray-200 dark:border-gray-700 w-[80px]",
                  isScrolled ? "left-[60px]" : "left-[200px]"
                )}>
                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                    Points
                  </div>
                </th>
                {/* Event column headers */}
                {data.events.map((event) => (
                  <th key={event.id.toString()} className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-r border-gray-200 dark:border-gray-700 min-w-[180px]">
                    <Link href={`/events/${event.id}`} 
                          className="block hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <div className="font-medium text-sm">{truncateText(event.title, 25)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(event.startingAt)}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        Weight: {event.weight}
                      </div>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white dark:bg-gray-900">
              {data.users.map((user) => (
                <tr key={user.user.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  {/* User info cell - Modified for proper collapse */}
                  <td className={cn(
                    "sticky left-0 z-20 bg-white dark:bg-gray-900 px-4 py-3 border-b border-r border-gray-200 dark:border-gray-700",
                    isScrolled ? "w-[60px]" : "w-[200px]"
                  )}>
                    <Link href={`/users/${user.user.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                      <UserAvatar user={user.user} className="w-8 h-8 shrink-0" />
                      <div className={cn(
                        "min-w-0 overflow-hidden",
                        isScrolled ? "hidden" : "block"
                      )}>
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {formatName(user.user.name)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          @{formatUsername(user.user.username)}
                        </div>
                      </div>
                    </Link>
                  </td>
                  
                  {/* Score cell - Modified position */}
                  <td className={cn(
                    "sticky z-20 bg-white dark:bg-gray-900 px-4 py-3 border-b border-r border-gray-200 dark:border-gray-700",
                    isScrolled ? "left-[60px]" : "left-[200px]"
                  )}>
                    <div className="font-mono font-medium text-blue-600 dark:text-blue-400">
                      {user.score.toFixed(2)}
                    </div>
                  </td>

                  {/* Event cells */}
                  {data.events.map((event) => {
                    const solveData = getSolveData(user.user.id, event.id);
                    return (
                      <td
                        key={event.id.toString()}
                        className={cn(
                          "px-4 py-3 border-b border-r border-gray-200 dark:border-gray-700",
                          solveData && !solveData.isPresent 
                            ? "bg-red-50 dark:bg-red-900/20"
                            : solveData && (solveData.solveCount > 0 || solveData.upsolveCount > 0)
                              ? "bg-green-50 dark:bg-green-900/20"
                              : ""
                        )}
                      >
                        <SolveDataContent solveData={solveData} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Update SolveDataContent to use proper type checking
function SolveDataContent({ solveData }: { solveData: UserSolveData | null }) {
  if (!solveData) return null;

  const hasActivity = solveData.solveCount > 0 || solveData.upsolveCount > 0;

  return (
    <div className="space-y-1">
      {!solveData.isPresent && (
        <div className="text-sm text-red-600 dark:text-red-400">Absent</div>
      )}
      {!hasActivity ? (
        <div className="text-sm text-gray-400 dark:text-gray-600">-</div>
      ) : (
        <>
          {solveData.solveCount > 0 && (
            <div className="text-sm text-green-600 dark:text-green-400">
              {solveData.solveCount} solve{solveData.solveCount > 1 ? 's' : ''}
            </div>
          )}
          {solveData.upsolveCount > 0 && (
            <div className="text-sm text-orange-600 dark:text-orange-400">
              {solveData.upsolveCount} upsolve{solveData.upsolveCount > 1 ? 's' : ''}
            </div>
          )}
          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {solveData.points.toFixed(2)} points
          </div>
        </>
      )}
    </div>
  );
}

// Define interface at top level
interface UserSolveData {
  solveCount: number;
  upsolveCount: number;
  points: number;
  isPresent: boolean;
}
