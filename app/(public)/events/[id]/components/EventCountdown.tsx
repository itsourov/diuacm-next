"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface EventCountdownProps {
  startTime: string;  // ISO string
  endTime: string;    // ISO string
  initialTimeLeft: TimeLeft | null;
  initialStatus: "upcoming" | "running" | "ended";
}

export default function EventCountdown({
  startTime,
  endTime,
  initialTimeLeft,
  initialStatus,
}: EventCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(initialTimeLeft);
  const [status, setStatus] = useState<"upcoming" | "running" | "ended">(initialStatus);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      let targetDate: Date;
      let newStatus = status;

      if (now < new Date(startTime)) {
        targetDate = new Date(startTime);
        newStatus = "upcoming";
      } else if (now < new Date(endTime)) {
        targetDate = new Date(endTime);
        newStatus = "running";
      } else {
        setTimeLeft(null);
        setStatus("ended");
        return;
      }

      setStatus(newStatus);
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [startTime, endTime]);

  if (!timeLeft) return null;

  const statusConfig = {
    upcoming: {
      text: "Starts in",
      bgClass: "bg-blue-500/10 dark:bg-blue-900/20",
      textClass: "text-blue-600 dark:text-blue-400",
    },
    running: {
      text: "Ends in",
      bgClass: "bg-green-500/10 dark:bg-green-900/20",
      textClass: "text-green-600 dark:text-green-400",
    },
    ended: {
      text: "Event ended",
      bgClass: "bg-gray-500/10 dark:bg-gray-900/20",
      textClass: "text-gray-600 dark:text-gray-400",
    },
  } as const;

  return (
    <div className={cn(
      "rounded-2xl p-6 sm:p-8",
      "bg-white dark:bg-gray-800",
      "shadow-xl hover:shadow-2xl transition-all duration-300",
      "border border-gray-200/50 dark:border-gray-700/50"
    )}>
      <div className="flex items-center gap-4 mb-6">
        <Timer className={cn(
          "w-8 h-8",
          statusConfig[status].textClass
        )} />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {statusConfig[status].text}
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Days", value: timeLeft.days },
          { label: "Hours", value: timeLeft.hours },
          { label: "Minutes", value: timeLeft.minutes },
          { label: "Seconds", value: timeLeft.seconds },
        ].map(({ label, value }) => (
          <div
            key={label}
            className={cn(
              "p-4 sm:p-6 rounded-xl text-center",
              statusConfig[status].bgClass
            )}
          >
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
              {value.toString().padStart(2, "0")}
            </div>
            <div className={cn(
              "text-sm font-medium",
              statusConfig[status].textClass
            )}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}