import { Skeleton } from "@/components/ui/skeleton";
import StatusBar from "./components/StatusBar";

export default function EventLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <StatusBar />
      
      {/* Hero Section Skeleton */}
      <div className="relative py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <Skeleton className="h-10 w-32" />
            <div className="space-y-4 max-w-4xl">
              <Skeleton className="h-16 w-3/4" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}