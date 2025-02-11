"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import UserAvatar from "@/components/UserAvatar";
import { Trophy, Award, Star } from "lucide-react";
import {RankListUserWithRelations, CurrentUser, User} from "../types";
import { loadMoreUsers, toggleRankListSubscription } from "../actions";
import PointHistoryModal from "./PointHistoryModal";
import {cn} from "@/lib/utils";

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
  const [users, setUsers] = useState<RankListUserWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedUser, setSelectedUser] = useState<RankListUserWithRelations | null>(
    null
  );
  const { toast } = useToast();

  const loadUsers = async (isInitial = false) => {
    setLoading(true);
    try {
      const skip = isInitial ? 0 : users.length;
      const result = await loadMoreUsers(rankListId, skip, 20);

      if (result.success && result.users) {
        setUsers(isInitial ? result.users : [...users, ...result.users]);
        setHasMore(result.users.length === 20);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to load users",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(true);
  }, [rankListId]);

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
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to update subscription",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Participants
        </h2>
        <Button
          variant={isSubscribed ? "destructive" : "default"}
          onClick={handleSubscriptionToggle}
        >
          {isSubscribed ? "Leave Ranklist" : "Join Ranklist"}
        </Button>
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
              {users.map((user, index) => (
                <tr
                  key={user.userId}
                  className={cn(
                    "border-b border-gray-100 dark:border-gray-800",
                    user.userId === currentUser?.id &&
                      "bg-blue-50/50 dark:bg-blue-900/10"
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

        {hasMore && (
          <div className="p-4 flex justify-center">
            <Button
              variant="outline"
              onClick={() => loadUsers()}
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More"}
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
        <Button variant="outline" size="sm" onClick={onViewHistory}>
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