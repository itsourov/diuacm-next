'use client';

import { RankListWithUsers } from "../types";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChartBar, Trophy, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import UserPointsModal from "./UserPointsModal";

const ITEMS_PER_PAGE = 20;

function getCFRatingColor(rating: number | null): string {
  if (!rating) return 'text-gray-600 dark:text-gray-400';
  if (rating >= 2400) return 'text-red-600 dark:text-red-400';
  if (rating >= 2100) return 'text-orange-600 dark:text-orange-400';
  if (rating >= 1900) return 'text-purple-600 dark:text-purple-400';
  if (rating >= 1600) return 'text-blue-600 dark:text-blue-400';
  if (rating >= 1400) return 'text-cyan-600 dark:text-cyan-400';
  if (rating >= 1200) return 'text-green-600 dark:text-green-400';
  return 'text-gray-600 dark:text-gray-400';
}

interface RankListProps {
  rankList: RankListWithUsers;
  currentUserLogin?: string;
}

export default function RankList({ rankList, currentUserLogin = 'itsourov' }: RankListProps) {
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [selectedUser, setSelectedUser] = useState<RankListWithUsers['rankListUsers'][0]['user'] | null>(null);

  const displayedUsers = rankList.rankListUsers.slice(0, displayCount);
  const hasMore = displayCount < rankList.rankListUsers.length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">User</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Score</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {displayedUsers.map((rankListUser, index) => {
                const user = rankListUser.user;
                const rank = index + 1;
                const isCurrentUser = user.username === currentUserLogin;

                return (
                  <tr
                    key={user.id}
                    className={cn(
                      "transition-colors duration-200",
                      isCurrentUser ? "bg-blue-50/50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                    )}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {rank <= 3 ? (
                          <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full",
                            rank === 1 && "bg-yellow-100 dark:bg-yellow-900/30",
                            rank === 2 && "bg-gray-100 dark:bg-gray-700/30",
                            rank === 3 && "bg-amber-100 dark:bg-amber-900/30"
                          )}>
                            {rank === 1 && <Trophy className="w-4 h-4 text-yellow-500" />}
                            {rank === 2 && <Medal className="w-4 h-4 text-gray-400" />}
                            {rank === 3 && <Medal className="w-4 h-4 text-amber-600" />}
                          </div>
                        ) : (
                          <span className="w-8 text-center font-medium text-gray-600 dark:text-gray-400">
                            {rank}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/users/${user.username}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="relative flex-shrink-0">
                          <Image
                            src={user.image || '/images/default-avatar.png'}
                            alt={user.name}
                            width={40}
                            height={40}
                            className={cn(
                              "rounded-full",
                              isCurrentUser && "ring-2 ring-blue-500 dark:ring-blue-400"
                            )}
                          />
                          {isCurrentUser && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full 
                                          flex items-center justify-center">
                              <span className="text-[10px] text-white">★</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white
                                        group-hover:text-blue-500 dark:group-hover:text-blue-400">
                            {user.name}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-blue-500 dark:text-blue-400">
                                (You)
                              </span>
                            )}
                          </div>
                          {user.codeforcesHandle && (
                            <div className="text-xs space-x-2">
                              <span className={cn(
                                "font-medium",
                                getCFRatingColor(user.maxCfRating)
                              )}>
                                {user.codeforcesHandle}
                              </span>
                              {user.maxCfRating && (
                                <span className="text-gray-400 dark:text-gray-500">
                                  ({user.maxCfRating})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex flex-col items-end">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {rankListUser.score.toFixed(2)}
                        </span>
                        {rank === 1 && (
                          <span className="text-xs text-yellow-500 dark:text-yellow-400">
                            Top Score
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
                          "transition-all duration-200",
                          "bg-blue-50 dark:bg-blue-900/20",
                          "hover:bg-blue-100 dark:hover:bg-blue-900/40",
                          "text-blue-600 dark:text-blue-400",
                          "focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/30"
                        )}
                      >
                        <ChartBar className="w-4 h-4" />
                        Points History
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setDisplayCount(prev => prev + ITEMS_PER_PAGE)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg",
              "bg-white dark:bg-gray-800",
              "border border-gray-200 dark:border-gray-700",
              "text-gray-900 dark:text-white",
              "hover:bg-gray-50 dark:hover:bg-gray-700",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/30"
            )}
          >
            Load More
          </button>
        </div>
      )}

      {selectedUser && (
        <UserPointsModal
          user={selectedUser}
          eventRankLists={rankList.eventRankLists}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}