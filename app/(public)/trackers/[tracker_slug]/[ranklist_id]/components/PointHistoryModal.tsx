"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { getUserSolveStats } from "../actions";
import { RankListUserWithRelations, UserStatsWithPoints } from "../types";
import UserAvatar from "@/components/UserAvatar";
import { DateTime } from "@/lib/utils/datetime";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PointHistoryModalProps {
    user: RankListUserWithRelations | null;
    onClose: () => void;
    rankListId: string;
}

function formatNumber(num: number): string {
    return Number(num.toFixed(3)).toString();
}

export default function PointHistoryModal({
    user,
    onClose,
    rankListId,
}: PointHistoryModalProps) {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<UserStatsWithPoints | null>(null);

    useEffect(() => {
        const loadSolveStats = async () => {
            if (!user) return;

            setLoading(true);
            try {
                const result = await getUserSolveStats(user.userId, rankListId);
                if (result.success && result.solveStats && result.totalStats) {
                    setStats({
                        solveStats: result.solveStats,
                        totalStats: result.totalStats,
                    });
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
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 bg-white dark:bg-gray-900/95 backdrop-blur-xl border-gray-200 dark:border-gray-700/50">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700/50 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30">
                    <DialogHeader className="space-y-6">
                        <div className="flex items-center gap-4">
                            <UserAvatar user={user.user} className="w-12 h-12" />
                            <div>
                                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {user.user.name}
                                </DialogTitle>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    @{user.user.username}
                                </p>
                            </div>
                        </div>

                        {stats && (
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { label: "Events", value: stats.totalStats.totalEvents },
                                    { label: "Solves", value: stats.totalStats.totalSolves },
                                    { label: "Upsolves", value: stats.totalStats.totalUpsolves },
                                ].map((stat, i) => (
                                    <StatBox key={i} {...stat} />
                                ))}
                            </div>
                        )}
                    </DialogHeader>
                </div>

                <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900/30">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700/50">
                            {stats?.solveStats.map((stat) => (
                                <Link
                                    key={stat.id.toString()}
                                    href={`/events/${stat.eventId}`}
                                    className="block p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <h3 className="font-medium text-base text-gray-900 dark:text-gray-100 mb-2">
                                        {stat.event.title}
                                    </h3>

                                    <div className="flex items-center gap-3 text-sm mb-2">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            stat.isPresent
                                                ? "bg-emerald-500"
                                                : "bg-rose-500"
                                        )} />
                                        <div className="text-gray-600 dark:text-gray-300">
                                            {stat.solveCount} solves
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-300">
                                            {stat.upsolveCount} upsolves
                                        </div>
                                        <div className="text-blue-600 dark:text-blue-400 font-medium">
                                            {formatNumber(stat.points.totalPoints)} points
                                        </div>
                                    </div>

                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {DateTime.formatDisplay(stat.event.startingAt)}
                                    </div>
                                </Link>
                            ))}

                            {(!stats || stats.solveStats.length === 0) && (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                    No solve statistics found.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

interface StatBoxProps {
    label: string;
    value: number;
}

function StatBox({ label, value }: StatBoxProps) {
    return (
        <div className="bg-white/90 dark:bg-gray-800/50 rounded-xl p-3 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
        </div>
    );
}