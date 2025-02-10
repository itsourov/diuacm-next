"use client";

import { SolveStat } from "@prisma/client";
import { Trophy, Target, Award, Check, X, Star, Users } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { cn } from "@/lib/utils";

interface SolveStatsSectionProps {
  solveStats: Array<SolveStat & {
    user: {
      id: string;
      name: string;
      username: string;
      image: string | null;
    };
  }>;
  userSolveStat: (SolveStat & {
    user: {
      id: string;
      name: string;
      username: string;
      image: string | null;
    };
  }) | null;
  currentUserName?: string;
}

export default function SolveStatsSection({
  solveStats,
  userSolveStat,
  currentUserName,
}: SolveStatsSectionProps) {
  const sortedStats = [...solveStats].sort((a, b) => {
    const totalA = Number(a.solveCount) + Number(a.upsolveCount);
    const totalB = Number(b.solveCount) + Number(b.upsolveCount);
    return totalB - totalA;
  });

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return {
          icon: Trophy,
          className: "text-amber-500 bg-amber-50 dark:bg-amber-900/20"
        };
      case 1:
        return {
          icon: Award,
          className: "text-gray-500 bg-gray-50 dark:bg-gray-900/20"
        };
      case 2:
        return {
          icon: Star,
          className: "text-amber-600 bg-amber-50/50 dark:bg-amber-900/20"
        };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Your Performance Card */}
      {userSolveStat && (
        <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <Target className="w-8 h-8 text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Your Performance
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                  During Contest
                </p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                  {userSolveStat.solveCount.toString()}
                </p>
              </div>

              <div className="p-6 rounded-xl bg-green-50 dark:bg-green-900/20">
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                  Upsolves
                </p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                  {userSolveStat.upsolveCount.toString()}
                </p>
              </div>

              <div className="p-6 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                  Total
                </p>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                  {(Number(userSolveStat.solveCount) + Number(userSolveStat.upsolveCount)).toString()}
                </p>
              </div>

              <div className="p-6 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">
                  Present
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                    {userSolveStat.isPresent ? "Yes" : "No"}
                  </p>
                  {userSolveStat.isPresent ? (
                    <Check className="w-6 h-6 text-green-500" />
                  ) : (
                    <X className="w-6 h-6 text-red-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Solve Statistics Table */}
      <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <Users className="w-8 h-8 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Solve Statistics ({solveStats.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Rank</th>
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Participant</th>
                  <th className="py-4 px-4 text-right text-sm font-medium text-gray-500 dark:text-gray-400">During Contest</th>
                  <th className="py-4 px-4 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Upsolves</th>
                  <th className="py-4 px-4 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Total</th>
                  <th className="py-4 px-4 text-center text-sm font-medium text-gray-500 dark:text-gray-400">Present</th>
                </tr>
              </thead>
              <tbody>
                {sortedStats.map((stat, index) => {
                  const rankBadge = getRankBadge(index);
                  return (
                    <tr
                      key={stat.userId}
                      className={cn(
                        "border-b border-gray-100 dark:border-gray-800",
                        stat.user.username === currentUserName && 
                        "bg-blue-50/50 dark:bg-blue-900/10"
                      )}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {rankBadge ? (
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center",
                              rankBadge.className
                            )}>
                              <rankBadge.icon className="w-5 h-5" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                              {index + 1}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={stat.user} className="w-10 h-10" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {stat.user.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              @{stat.user.username}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-lg font-medium text-gray-900 dark:text-white">
                        {stat.solveCount.toString()}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-lg font-medium text-gray-900 dark:text-white">
                        {stat.upsolveCount.toString()}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-lg font-medium text-gray-900 dark:text-white">
                        {(Number(stat.solveCount) + Number(stat.upsolveCount)).toString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center">
                          {stat.isPresent ? (
                            <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                              <Check className="w-5 h-5 text-green-500" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                              <X className="w-5 h-5 text-red-500" />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}