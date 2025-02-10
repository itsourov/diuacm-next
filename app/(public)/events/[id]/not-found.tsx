import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function EventNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="space-y-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Event Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Link 
            href="/events"
            className="inline-flex items-center px-6 py-3 rounded-xl
              bg-blue-600 hover:bg-blue-700 
              text-white font-medium transition-colors"
          >
            Back to Events
          </Link>
        </div>
      </div>
    </div>
  );
}