import { getTrackerDetails } from "./actions";
import { notFound } from "next/navigation";
import RankList from "./components/RankList";
import EventList from "./components/EventList";
import RankListSelector from "./components/RankListSelector";
import { CustomTabs } from "./components/CustomTabs";
import { TabsContent } from "@/components/ui/tabs";
import { CalendarDays, Users } from "lucide-react";

interface PageProps {
  params: {
    slug: string;
    ranklistId: string;
  };
}

export default async function TrackerDetailsPage({ params }: PageProps) {
  const { tracker, rankList, error } = await getTrackerDetails(
    params.slug,
    params.ranklistId
  );

  if (error || !tracker || !rankList) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              {tracker.title}
            </h1>
            {tracker.description && (
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                {tracker.description}
              </p>
            )}
            
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>{rankList.rankListUsers.length} Participants</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <CalendarDays className="w-4 h-4" />
                <span>{rankList.eventRankLists.length} Events</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {rankList.title}
            </h2>
            <div className="w-full sm:w-64">
              <RankListSelector
                rankLists={tracker.rankLists}
                currentRankListId={rankList.id.toString()}
                trackerSlug={tracker.slug}
              />
            </div>
          </div>

          <CustomTabs 
            defaultValue="rankings"
            tabs={[
              { value: "rankings", label: `Rankings (${rankList.rankListUsers.length})` },
              { value: "events", label: `Events (${rankList.eventRankLists.length})` }
            ]}
          >
            <TabsContent value="rankings" className="mt-6">
              <RankList 
                rankList={rankList}
                currentUserLogin="itsourov"
              />
            </TabsContent>
            <TabsContent value="events" className="mt-6">
              <EventList 
                events={rankList.eventRankLists.map(erl => ({
                  event: erl.event,
                  weight: erl.weight
                }))} 
              />
            </TabsContent>
          </CustomTabs>
        </div>
      </div>
    </div>
  );
}