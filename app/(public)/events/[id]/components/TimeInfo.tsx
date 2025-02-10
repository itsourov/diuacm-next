"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { DateTime } from "@/lib/utils/datetime";
import { Clock, Globe } from "lucide-react";

export default function TimeInfo() {
  const [currentTime, setCurrentTime] = useState(DateTime.getCurrentUTCTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(DateTime.getCurrentUTCTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="border-0 bg-white dark:bg-gray-800/50">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="font-mono text-gray-900 dark:text-gray-100">
              {currentTime.toISOString().replace('T', ' ').substring(0, 19)} UTC
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-900 dark:text-gray-100">
              Your timezone: {DateTime.getUserTimezone()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}