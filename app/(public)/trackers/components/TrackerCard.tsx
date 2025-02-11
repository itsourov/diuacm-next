import { TrackerWithRankLists } from "../types";
import Link from "next/link";
import { ChevronRight, ListOrdered, Users } from "lucide-react";

interface TrackerCardProps {
  tracker: TrackerWithRankLists;
}

export default function TrackerCard({ tracker }: TrackerCardProps) {
  // Get the latest rank list if available
  const latestRankList = tracker.rankLists[0];

  return (
    <Link 
      href={`/trackers/${tracker.slug}${latestRankList ? `/${latestRankList.id}` : ''}`}
      className="block group"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
                    hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200
                    hover:shadow-lg hover:shadow-blue-500/10">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white
                           group-hover:text-blue-500 dark:group-hover:text-blue-400">
                {tracker.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {tracker.description}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500
                                   dark:text-gray-600 dark:group-hover:text-blue-400
                                   transition-colors duration-200" />
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <ListOrdered className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {tracker.rankLists.length} Ranklists
              </span>
            </div>
            {latestRankList && (
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Latest: {latestRankList.session}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}