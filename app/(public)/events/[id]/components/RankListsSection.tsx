import { ListChecks } from "lucide-react";
import Link from "next/link";

interface RankList {
  id: bigint;
  title: string;
  session: string;
  description: string | null;
  weightOfUpsolve: number;
  tracker: {
    slug: string;
  };
}

interface EventRankList {
  id: bigint;
  weight: number;
  rankList: RankList;
}

interface RankListsSectionProps {
  eventRankLists: EventRankList[];
}

export default function RankListsSection({ eventRankLists }: RankListsSectionProps) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-xl overflow-hidden">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <ListChecks className="w-8 h-8 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Connected Ranklists ({eventRankLists.length})
          </h2>
        </div>

        <div className="space-y-4">
          {eventRankLists.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No ranklists are connected to this event.
            </p>
          ) : (
            eventRankLists.map(({ id, weight, rankList }) => (
              <div
                key={String(id)}
                className="p-6 rounded-xl bg-gray-50 dark:bg-gray-900"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <Link 
                      href={`/trackers/${rankList.tracker.slug}/${rankList.id}`}
                      className="group inline-block"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {rankList.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Session: {rankList.session}
                    </p>
                    {rankList.description && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        {rankList.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Weight: {weight}
                      </p>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        Upsolve Weight: {rankList.weightOfUpsolve}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
