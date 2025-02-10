"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { DateTime } from "@/lib/utils/datetime";
import { cn } from "@/lib/utils";

interface EventCountdownProps {
  startTime: Date;
  endTime: Date;
  className?: string;
}

export default function EventCountdown({
  startTime,
  endTime,
  className,
}: EventCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  const [status, setStatus] = useState<"upcoming" | "running" | "ended">("ended");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = DateTime.getCurrentUTCTime();
      let targetDate: Date;
      let newStatus: "upcoming" | "running" | "ended";

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

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [startTime, endTime]);

  if (!timeLeft) return null;

  const statusConfig = {
    upcoming: {
      text: "Starts in",
      className: "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10",
    },
    running: {
      text: "Ends in",
      className: "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10",
    },
    ended: {
      text: "Event ended",
      className: "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10",
    },
  };

  return (
    <Card
      className={cn(
        "border",
        statusConfig[status].className,
        className
      )}
    >
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {statusConfig[status].text}
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Days", value: timeLeft.days },
            { label: "Hours", value: timeLeft.hours },
            { label: "Minutes", value: timeLeft.minutes },
            { label: "Seconds", value: timeLeft.seconds },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800/50 rounded-lg"
            >
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {value.toString().padStart(2, "0")}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}