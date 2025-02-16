import TrackerCard from './components/TrackerCard';
import EmptyState from './components/EmptyState';
import { getTrackers } from './actions';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Programming Trackers | DIU ACM Community',
  description: 'Track your competitive programming progress, view rankings, and compare performance with fellow programmers in the DIU ACM community.',
  keywords: ['programming tracker', 'competitive programming', 'performance tracking', 'programming rankings', 'DIU ACM']
};

export default async function TrackersPage() {
  try {
    const trackers = await getTrackers();

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-b from-blue-50/20 to-transparent dark:from-blue-900/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Programming Trackers
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Track your progress and compete with others
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-6">
            {trackers.length > 0 ? (
              trackers.map((tracker) => (
                <TrackerCard key={tracker.id.toString()} tracker={tracker} />
              ))
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg">
            <p className="text-red-600 dark:text-red-400">
              Failed to load trackers: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        </div>
      </div>
    );
  }
}