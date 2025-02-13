export default function LoginLoading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
                    {/* Header Skeleton */}
                    <div className="text-center mb-8">
                        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-2 animate-pulse" />
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto animate-pulse" />
                    </div>

                    {/* Form Fields Skeleton */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                        </div>
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                    </div>

                    {/* Divider Skeleton */}
                    <div className="my-6">
                        <div className="h-px bg-gray-200 dark:bg-gray-700 w-full" />
                    </div>

                    {/* Social Button Skeleton */}
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />

                    {/* Sign Up Link Skeleton */}
                    <div className="mt-8 flex justify-center space-x-1">
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}
