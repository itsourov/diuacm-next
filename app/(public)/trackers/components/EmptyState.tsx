import { FolderOpen } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full
                    bg-gray-100 dark:bg-gray-800 mb-4">
        <FolderOpen className="w-6 h-6 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No Trackers Found
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        There are no trackers available at the moment.
      </p>
    </div>
  );
}