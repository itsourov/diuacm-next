"use client";

import { useEffect, useState } from "react";
import { Clock, User } from "lucide-react";

interface StatusBarProps {
  initialTime: string; // Format: YYYY-MM-DD HH:MM:SS
  username: string;
}

export default function StatusBar({ initialTime, username }: StatusBarProps) {
  // Use the server-provided initial time
  const [currentTime, setCurrentTime] = useState(initialTime);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const formatted = now.toISOString()
          .replace('T', ' ')
          .split('.')[0];
      setCurrentTime(formatted);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <code className="font-mono text-base text-gray-900 dark:text-gray-100">
                {currentTime} UTC
              </code>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl
              bg-gradient-to-r from-blue-500/10 to-purple-500/10
              dark:from-blue-500/20 dark:to-purple-500/20
              border border-blue-100/20 dark:border-blue-500/20">
                <User className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                @{username}
              </span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}