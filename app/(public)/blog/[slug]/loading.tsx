export default function Loading() {
  return (
    <article className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Skeleton */}
      <div className="relative h-[40vh] sm:h-[50vh] lg:h-[60vh] bg-gray-200 dark:bg-gray-700 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/50 to-gray-900/90">
          <div className="absolute inset-0 flex items-end">
            <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-16">
              {/* Tags Skeleton */}
              <div className="flex gap-2 mb-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-6 w-20 bg-white/20 rounded-full animate-pulse"
                  />
                ))}
              </div>

              {/* Title Skeleton */}
              <div className="h-12 w-3/4 bg-white/20 rounded-lg animate-pulse mb-4" />

              {/* Description Skeleton */}
              <div className="h-6 w-2/3 bg-white/20 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 relative z-10">
        {/* Author Card Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="flex-1">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <div className="space-y-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-11/12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
