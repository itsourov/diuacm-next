'use client';

import { RankList } from "@prisma/client";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTime } from "@/lib/utils/datetime";
import { cn } from "@/lib/utils";

interface RankListSelectorProps {
  rankLists: RankList[];
  currentRankListId: string;
  trackerSlug: string;
}

export default function RankListSelector({
  rankLists,
  currentRankListId,
  trackerSlug
}: RankListSelectorProps) {
  const router = useRouter();

  // Sort ranklists by createdAt in descending order
  const sortedRankLists = [...rankLists].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Select
      value={currentRankListId}
      onValueChange={(value) => {
        router.push(`/trackers/${trackerSlug}/${value}`);
      }}
    >
      <SelectTrigger 
        className={cn(
          "w-full border-gray-200 bg-white text-gray-900",
          "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100",
          "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "dark:focus:ring-offset-gray-900",
          "h-10 px-3 py-2 text-sm"
        )}
      >
        <SelectValue 
          placeholder="Select a session" 
          className="text-gray-500 dark:text-gray-400"
        />
      </SelectTrigger>
      <SelectContent 
        className={cn(
          "bg-white border border-gray-200",
          "dark:bg-gray-800 dark:border-gray-700",
          "min-w-[200px]"
        )}
      >
        {sortedRankLists.map((rankList) => (
          <SelectItem
            key={rankList.id.toString()}
            value={rankList.id.toString()}
            className={cn(
              "py-2.5 pl-8 pr-4",
              "focus:bg-blue-50 dark:focus:bg-blue-900/20",
              "focus:text-blue-600 dark:focus:text-blue-400",
              "data-[state=checked]:bg-blue-50 dark:data-[state=checked]:bg-blue-900/20",
              "data-[state=checked]:text-blue-600 dark:data-[state=checked]:text-blue-400"
            )}
          >
            <div className="flex flex-col">
              <span className="font-medium">{rankList.title}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {DateTime.formatDisplay(rankList.createdAt, {
                  format: 'local',
                  includeTime: true
                })}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
