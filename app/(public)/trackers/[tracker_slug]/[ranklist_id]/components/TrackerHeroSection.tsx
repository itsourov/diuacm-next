"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { RankList } from "@prisma/client";
import { TrackerWithRelations } from "../types";

interface TrackerHeroSectionProps {
  tracker: TrackerWithRelations;
  currentRankList: RankList;
  rankLists: RankList[];
}

export default function TrackerHeroSection({
  tracker,
  currentRankList,
  rankLists,
}: TrackerHeroSectionProps) {
  const router = useRouter();

  const handleRankListChange = (value: string) => {
    router.push(`/trackers/${tracker.slug}/${value}`);
  };

  return (
    <div className="relative py-12 bg-white dark:bg-gray-900">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/20 to-transparent dark:from-blue-900/10" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Tracker Badge */}
          <div className="inline-flex items-center px-4 py-2.5 rounded-2xl
            bg-gradient-to-r from-blue-500/10 to-purple-500/10 
            dark:from-blue-500/20 dark:to-purple-500/20
            backdrop-blur-xl shadow-lg shadow-blue-500/10 dark:shadow-blue-500/20
            border border-blue-100/20 dark:border-blue-500/20
            text-blue-600 dark:text-blue-400 font-medium">
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Tracker
            </div>
          </div>

          {/* Title and Description */}
          <div className="space-y-4 max-w-4xl">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
              {tracker.title}
            </h1>
            {tracker.description && (
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                {tracker.description}
              </p>
            )}
          </div>

          {/* RankList Selector */}
          <div className="flex items-center gap-4">
            <Select
              value={currentRankList.id.toString()}
              onValueChange={handleRankListChange}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a ranklist" />
              </SelectTrigger>
              <SelectContent>
                {rankLists.map((rankList) => (
                  <SelectItem
                    key={rankList.id.toString()}
                    value={rankList.id.toString()}
                  >
                    {rankList.title} ({rankList.session})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => router.refresh()}>
              Refresh Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}