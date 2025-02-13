export default function RegisterLoading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full my-10">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
                    {/* Header Skeleton */}
                    <div className="text-center mb-8">
                        <div className="h-8 w-56 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-2 animate-pulse" />
                        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto animate-pulse" />
                    </div>

                    {/* Information Message Skeleton */}
                    <div className="mb-8 space-y-4">
                        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse">
                            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-600 rounded mb-4" />
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-3 w-5/6 bg-gray-200 dark:bg-gray-600 rounded" />
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse">
                            <div className="h-3 w-full bg-gray-200 dark:bg-gray-600 rounded" />
                        </div>
                    </div>

                    {/* Social Button Skeleton */}
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />

                    {/* Sign In Link Skeleton */}
                    <div className="mt-8 flex justify-center space-x-1">
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}
