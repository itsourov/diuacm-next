"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function EventDetailsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Event details error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="p-6">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              Something went wrong
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {error.message || "Failed to load event details"}
            </p>
            <div className="mt-6">
              <Button onClick={reset}>Try again</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}