// app/(public)/events/[id]/components/SolveStatsSection.tsx
"use client";

import { SolveStat } from "@prisma/client";
import { Trophy, Target, Award, Check, X, Star, Users } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  username: string;
  image: string | null;
}

interface SolveStatWithUser extends SolveStat {
  user: User;
}

interface SolveStatsSectionProps {
  solveStats: SolveStatWithUser[];
  userSolveStat: SolveStatWithUser | null;
  currentUserName?: string;
}

export default function SolveStatsSection({
  solveStats,
  userSolveStat,
  currentUserName,
}: SolveStatsSectionProps) {
  // Sort stats by total solve count
  const sortedStats = [...solveStats].sort((a, b) => {
    const totalA = Number(a.solveCount) + Number(a.upsolveCount);
    const totalB = Number(b.solveCount) + Number(b.upsolveCount);
    return totalB - totalA || // Sort by total solves
      Number(b.solveCount) - Number(a.solveCount) || // Then by contest solves
      (a.user.username > b.user.username ? 1 : -1); // Then alphabetically by username
  });


  return (
    <div className="space-y-8">
      {/* User's Performance Card */}
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
              <StatCard
                label="During Contest"
                value={Number(userSolveStat.solveCount)}
                colorClass="blue"
              />
              <StatCard
                label="Upsolves"
                value={Number(userSolveStat.upsolveCount)}
                colorClass="green"
              />
              <StatCard
                label="Total"
                value={Number(userSolveStat.solveCount) + Number(userSolveStat.upsolveCount)}
                colorClass="purple"
              />
              <PresenceCard isPresent={userSolveStat.isPresent} />
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
                {sortedStats.map((stat, index) => (
                  <tr
                    key={stat.userId}
                    className={cn(
                      "border-b border-gray-100 dark:border-gray-800",
                      stat.user.username === currentUserName &&
                      "bg-blue-50/50 dark:bg-blue-900/10"
                    )}
                  >
                    <RankCell index={index} />
                    <UserCell user={stat.user} />
                    <StatValueCell value={Number(stat.solveCount)} />
                    <StatValueCell value={Number(stat.upsolveCount)} />
                    <StatValueCell value={Number(stat.solveCount) + Number(stat.upsolveCount)} />
                    <PresenceStatusCell isPresent={stat.isPresent} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
interface StatCardProps {
  label: string;
  value: number;
  colorClass: 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ label, value, colorClass }: StatCardProps) {
  const colors = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
  };

  return (
    <div className={cn("p-6 rounded-xl", colors[colorClass])}>
      <p className="text-sm font-medium mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function PresenceCard({ isPresent }: { isPresent: boolean }) {
  return (
    <div className="p-6 rounded-xl bg-orange-50 dark:bg-orange-900/20">
      <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">
        Present
      </p>
      <div className="flex items-center gap-2">
        <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
          {isPresent ? "Yes" : "No"}
        </p>
        {isPresent ? (
          <Check className="w-6 h-6 text-green-500" />
        ) : (
          <X className="w-6 h-6 text-red-500" />
        )}
      </div>
    </div>
  );
}

function RankCell({ index }: { index: number }) {
  const rankBadge = getRankBadge(index);
  return (
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
  );
}

function UserCell({ user }: { user: User }) {
  return (
    <td className="py-4 px-4">
      <div className="flex items-center gap-3">
        <UserAvatar user={user} className="w-10 h-10" />
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {user.name}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            @{user.username}
          </p>
        </div>
      </div>
    </td>
  );
}

function StatValueCell({ value }: { value: number }) {
  return (
    <td className="py-4 px-4 text-right font-mono text-lg font-medium text-gray-900 dark:text-white">
      {value}
    </td>
  );
}

function PresenceStatusCell({ isPresent }: { isPresent: boolean }) {
  return (
    <td className="py-4 px-4">
      <div className="flex justify-center">
        {isPresent ? (
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
  );
}

function getRankBadge(index: number) {
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
}