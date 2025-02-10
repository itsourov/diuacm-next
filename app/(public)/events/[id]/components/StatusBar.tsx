"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { DateTime } from "@/lib/utils/datetime";
import { Clock, User } from "lucide-react";

interface StatusBarProps {
  username: string;
}

export default function StatusBar({ username }: StatusBarProps) {
  const [currentTime, setCurrentTime] = useState(DateTime.getCurrentUTCTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(DateTime.getCurrentUTCTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="border-0 bg-gray-50/50 dark:bg-gray-800/50">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between flex-wrap gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <code className="font-mono text-gray-900 dark:text-gray-100">
              {currentTime.toISOString().slice(0, 19).replace('T', ' ')} UTC
            </code>
          </div>
          <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span>@{username}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}