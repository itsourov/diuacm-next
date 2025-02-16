export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-pulse">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back button placeholder */}
                <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />

                {/* Profile card placeholder */}
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
                    {/* Cover image placeholder */}
                    <div className="h-32 bg-gray-200 dark:bg-gray-700" />

                    {/* Content placeholder */}
                    <div className="px-4 sm:px-6 lg:px-8 pb-8">
                        {/* Avatar placeholder */}
                        <div className="relative -mt-16 mb-4">
                            <div className="w-32 h-32 mx-auto rounded-xl bg-gray-200 dark:bg-gray-700 ring-8 ring-white dark:ring-gray-800" />
                        </div>

                        {/* Info placeholders */}
                        <div className="space-y-4 text-center">
                            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
                            <div className="flex justify-center gap-3 mt-4">
                                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                            </div>
                        </div>

                        {/* Handle placeholders */}
                        <div className="mt-6 space-y-4 max-w-2xl mx-auto">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
