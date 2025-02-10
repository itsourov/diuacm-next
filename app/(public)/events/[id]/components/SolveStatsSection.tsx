"use client";

import { SolveStat } from "@prisma/client";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UserAvatar from "@/components/UserAvatar";
import { Trophy, Award, Star } from "lucide-react";

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
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Award className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Star className="w-5 h-5 text-amber-600" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {userSolveStat && (
        <Card className="overflow-hidden border-0 bg-white dark:bg-gray-800/50">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Your Performance
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-blue-600 dark:text-blue-400">During Contest</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                  {userSolveStat.solveCount.toString()}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-sm text-green-600 dark:text-green-400">Upsolves</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
                  {userSolveStat.upsolveCount.toString()}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <p className="text-sm text-purple-600 dark:text-purple-400">Total</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">
                  {(Number(userSolveStat.solveCount) + Number(userSolveStat.upsolveCount)).toString()}
                </p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <p className="text-sm text-orange-600 dark:text-orange-400">Present</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300 mt-1">
                  {userSolveStat.isPresent ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden border-0 bg-white dark:bg-gray-800/50">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Solve Statistics ({solveStats.length})
          </h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead className="text-right">During Contest</TableHead>
                  <TableHead className="text-right">Upsolves</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Present</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStats.map((stat, index) => (
                  <TableRow 
                    key={stat.userId}
                    className={cn(
                      "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                      stat.user.username === currentUserName && "bg-blue-50/50 dark:bg-blue-900/10"
                    )}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getRankBadge(index)}
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserAvatar user={stat.user} className="w-6 h-6" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {stat.user.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            @{stat.user.username}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {stat.solveCount.toString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {stat.upsolveCount.toString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {(Number(stat.solveCount) + Number(stat.upsolveCount)).toString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {stat.isPresent ? (
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/20">
                          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/20">
                          <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
}