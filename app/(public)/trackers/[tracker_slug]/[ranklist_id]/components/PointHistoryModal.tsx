"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getUserSolveStats } from "../actions";
import { RankListUserWithRelations } from "../types";
import UserAvatar from "@/components/UserAvatar";
import { DateTime } from "@/lib/utils/datetime";
import { Check, X, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PointHistoryModalProps {
  user: RankListUserWithRelations | null;
  onClose: () => void;
  rankListId: string;
}

export default function PointHistoryModal({
                                            user,
                                            onClose,
                                            rankListId,
                                          }: PointHistoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [solveStats, setSolveStats] = useState<any[]>([]);

  useEffect(() => {
    const loadSolveStats = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const result = await getUserSolveStats(user.userId, rankListId);
        if (result.success && result.solveStats) {
          setSolveStats(result.solveStats);
        }
      } catch (error) {
        console.error("Error loading solve stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadSolveStats();
    }
  }, [user, rankListId]);

  if (!user) return null;

  return (
      <Dialog open={!!user} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
          <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Point History
              </DialogTitle>
            </DialogHeader>

            {/* User Info */}
            <div className="mt-4 flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <UserAvatar user={user.user} className="w-12 h-12" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {user.user.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  @{user.user.username}
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                </div>
            ) : (
                <div className="space-y-4">
                  {solveStats.map((stat) => (
                      <Link
                          key={stat.id.toString()}
                          href={`/events/${stat.eventId}`}
                          className={cn(
                              "block p-4 rounded-xl bg-white dark:bg-gray-800",
                              "border border-gray-100 dark:border-gray-700",
                              "hover:border-blue-500 dark:hover:border-blue-500",
                              "transition-colors duration-200"
                          )}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {stat.event.title}
                            </h4>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <div>During Contest: {stat.solveCount.toString()}</div>
                              <div>Upsolves: {stat.upsolveCount.toString()}</div>
                              <div className="flex items-center gap-2">
                                Present: {stat.isPresent ? (
                                  <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                  <X className="w-4 h-4 text-red-500" />
                              )}
                              </div>
                            </div>

                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {DateTime.formatDisplay(stat.event.startingAt, {
                                format: 'local',
                                includeTimezone: true,
                              })}
                            </div>
                          </div>

                          <ArrowUpRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        </div>
                      </Link>
                  ))}

                  {solveStats.length === 0 && (
                      <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                        No solve statistics found for this user.
                      </div>
                  )}
                </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
  );
}