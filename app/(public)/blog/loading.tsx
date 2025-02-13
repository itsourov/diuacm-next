export default function Loading() {
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero Section Skeleton */}
            <section className="relative py-24 bg-gradient-to-b from-blue-50/20 to-transparent dark:from-blue-900/10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-6">
                        <div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mx-auto" />
                        <div className="h-6 w-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mx-auto" />
                    </div>
                </div>
            </section>

            {/* Blog Grid Skeleton */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden"
                        >
                            {/* Image Skeleton */}
                            <div className="relative aspect-[16/9] bg-gray-200 dark:bg-gray-700 animate-pulse" />

                            <div className="p-6">
                                {/* Tags Skeleton */}
                                <div className="flex gap-2 mb-4">
                                    {[...Array(2)].map((_, j) => (
                                        <div
                                            key={j}
                                            className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
                                        />
                                    ))}
                                </div>

                                {/* Title Skeleton */}
                                <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-3" />

                                {/* Description Skeleton */}
                                <div className="space-y-2 mb-6">
                                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                </div>

                                {/* Meta Skeleton */}
                                <div className="flex gap-4">
                                    <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
