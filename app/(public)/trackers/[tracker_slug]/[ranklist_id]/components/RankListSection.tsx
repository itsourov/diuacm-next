"use client";

import { useEffect, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import UserAvatar from "@/components/UserAvatar";
import { Trophy, Award, Star, ArrowUpRight } from "lucide-react";
import { RankListUserWithRelations, CurrentUser, User } from "../types";
import { toggleRankListSubscription, getAllRankListUsers } from "../actions";
import PointHistoryModal from "./PointHistoryModal";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface RankListSectionProps {
  rankListId: string;
  currentUser: CurrentUser | null;
  isSubscribed: boolean;
}

export default function RankListSection({
  rankListId,
  currentUser,
  isSubscribed,
}: RankListSectionProps) {
  const [allUsers, setAllUsers] = useState<RankListUserWithRelations[]>([]);
  const [displayedUsers, setDisplayedUsers] = useState<
    RankListUserWithRelations[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] =
    useState<RankListUserWithRelations | null>(null);
  //   const [recalculateLoading, setRecalculateLoading] = useState(false);
  const { toast } = useToast();
  const PAGE_SIZE = 20;
  const pathname = usePathname();

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllRankListUsers(rankListId);
      if (result.success && result.users) {
        setAllUsers(result.users);
        setDisplayedUsers(result.users.slice(0, PAGE_SIZE));
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to load users",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [rankListId, toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const loadMore = useCallback(() => {
    const currentLength = displayedUsers.length;
    setDisplayedUsers(allUsers.slice(0, currentLength + PAGE_SIZE));
  }, [allUsers, displayedUsers.length]);

  const handleSubscriptionToggle = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to join the ranklist",
        variant: "destructive",
      });
      return;
    }

    const result = await toggleRankListSubscription(rankListId);
    if (result.success) {
      toast({
        title: isSubscribed ? "Unsubscribed" : "Subscribed",
        description: isSubscribed
          ? "You have left the ranklist"
          : "You have joined the ranklist",
        className: isSubscribed
          ? "bg-red-50 dark:bg-red-900/20"
          : "bg-green-50 dark:bg-green-900/20",
      });
      // Refresh the user list after subscription change
      loadUsers();
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to update subscription",
        variant: "destructive",
      });
    }
  };

  //   const handleRecalculateScores = async () => {
  //     setRecalculateLoading(true);
  //     try {
  //       const result = await recalculateRankListScores(rankListId);
  //       if (result.success) {
  //         toast({
  //           title: "Success",
  //           description: result.message,
  //           className: "bg-green-50 dark:bg-green-900/20",
  //         });
  //         // Reload the users list
  //         await loadUsers();
  //       } else {
  //         toast({
  //           title: "Error",
  //           description: result.message,
  //           variant: "destructive",
  //         });
  //       }
  //     } catch (error) {
  //       toast({
  //         title: "Error",
  //         description: "Failed to recalculate scores. " + error,
  //         variant: "destructive",
  //       });
  //     } finally {
  //       setRecalculateLoading(false);
  //     }
  //   };

  return (
    <div className="space-y-8">
      {/* Grid View Link - Moved to top */}
      <Link
        href={`${pathname}/grid`}
        className={cn(
          "block w-full",
          "bg-gradient-to-r from-blue-500 to-indigo-500",
          "px-6 py-4 rounded-2xl", // Made even larger
          "text-white font-medium",
          "border border-blue-600/20",
          "shadow-lg shadow-blue-500/30",
          "hover:shadow-blue-500/40 hover:scale-[1.02]",
          "dark:from-blue-600 dark:to-indigo-600",
          "dark:shadow-blue-500/20 dark:hover:shadow-blue-500/30",
          "transition-all duration-200"
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Grid View</h3>
            <p className="text-blue-100 dark:text-blue-200">
              View all contests and participants in a grid layout
            </p>
          </div>
          <ArrowUpRight className="w-6 h-6" />
        </div>
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Participants
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Remove the View Grid button from here */}
          {/* <Button
                        variant="outline"
                        onClick={handleRecalculateScores}
                        disabled={recalculateLoading}
                        className="w-full sm:w-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                        {recalculateLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Recalculating...
                            </>
                        ) : (
                            'Recalculate Scores'
                        )}
                    </Button> */}
          <Button
            variant={isSubscribed ? "destructive" : "default"}
            onClick={handleSubscriptionToggle}
            className={cn(
              "w-full sm:w-auto",
              isSubscribed
                ? "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                : "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700",
              "text-white"
            )}
          >
            {isSubscribed ? "Leave Ranklist" : "Join Ranklist"}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-4 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Rank
                </th>
                <th className="py-4 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Participant
                </th>
                <th className="py-4 px-4 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                  Score
                </th>
                <th className="py-4 px-4 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((user, index) => (
                <tr
                  key={user.userId}
                  onClick={() => setSelectedUser(user)}
                  className={cn(
                    "border-b border-gray-100 dark:border-gray-800",
                    user.userId === currentUser?.id &&
                      "bg-blue-50/50 dark:bg-blue-900/10",
                    "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  )}
                >
                  <RankCell index={index} />
                  <UserCell user={user.user} />
                  <ScoreCell score={user.score} />
                  <ActionCell
                    user={user}
                    onViewHistory={() => setSelectedUser(user)}
                  />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {displayedUsers.length < allUsers.length && (
          <div className="p-4 flex justify-center">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={loading}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300" />
                  Loading...
                </>
              ) : (
                "Load More"
              )}
            </Button>
          </div>
        )}
      </div>

      <PointHistoryModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        rankListId={rankListId}
      />
    </div>
  );
}

// Helper Components
function RankCell({ index }: { index: number }) {
  const rankBadge = getRankBadge(index);
  return (
    <td className="py-4 px-4">
      <div className="flex items-center gap-2">
        {rankBadge ? (
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              rankBadge.className
            )}
          >
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
      <Link
        href={`/users/${user.username}`}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        onClick={(e) => e.stopPropagation()} // Prevent triggering parent's onClick
      >
        <UserAvatar user={user} className="w-10 h-10" />
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {user.name}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            @{user.username}
          </p>
        </div>
      </Link>
    </td>
  );
}

function ScoreCell({ score }: { score: number }) {
  return (
    <td className="py-4 px-4 text-right">
      <p className="font-mono text-lg font-medium text-gray-900 dark:text-white">
        {score.toFixed(2)}
      </p>
    </td>
  );
}

function ActionCell({
  onViewHistory,
}: {
  user: RankListUserWithRelations;
  onViewHistory: () => void;
}) {
  return (
    <td className="py-4 px-4">
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onViewHistory}
          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          View History
        </Button>
      </div>
    </td>
  );
}

function getRankBadge(index: number) {
  switch (index) {
    case 0:
      return {
        icon: Trophy,
        className: "text-amber-500 bg-amber-50 dark:bg-amber-900/20",
      };
    case 1:
      return {
        icon: Award,
        className: "text-gray-500 bg-gray-50 dark:bg-gray-900/20",
      };
    case 2:
      return {
        icon: Star,
        className: "text-amber-600 bg-amber-50/50 dark:bg-amber-900/20",
      };
    default:
      return null;
  }
}
