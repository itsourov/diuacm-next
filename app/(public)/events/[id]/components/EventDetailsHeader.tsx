"use client";

import { Event } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DateTime } from "@/lib/utils/datetime";
import { Calendar, Clock, Globe, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EventDetailsHeaderProps {
  event: Event;
}

export default function EventDetailsHeader({ event }: EventDetailsHeaderProps) {
  const now = DateTime.getCurrentUTCTime();
  const startTime = new Date(event.startingAt);
  const endTime = new Date(event.endingAt);

  const getEventStatus = () => {
    if (now < startTime) {
      return {
        label: "Upcoming",
        variant: "blue" as const,
      };
    }
    if (now > endTime) {
      return {
        label: "Ended",
        variant: "secondary" as const,
      };
    }
    return {
      label: "Running",
      variant: "green" as const,
    };
  };

  const status = getEventStatus();

  return (
    <Card className="overflow-hidden border-0 bg-white dark:bg-gray-800/50">
      <div className="p-6">
        <div className="flex flex-col gap-6">
          {/* Title and Status */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {event.title}
              </h1>
              {event.description && (
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                  {event.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={status.variant}
                className={cn(
                  "px-2.5 py-0.5 text-xs font-medium",
                  status.variant === "blue" && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
                  status.variant === "green" && "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
                  status.variant === "secondary" && "bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300"
                )}
              >
                {status.label}
              </Badge>
              <Badge
                variant="outline"
                className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
              >
                {event.type}
              </Badge>
            </div>
          </div>

          {/* Event Details */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {DateTime.formatDisplay(startTime, { includeTimezone: false })}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {DateTime.formatDisplay(startTime, { format: 'local', includeTimezone: false }).split(',')[1].trim()} - {
                    DateTime.formatDisplay(endTime, { format: 'local', includeTimezone: false }).split(',')[1].trim()
                  }
                </span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {DateTime.formatTimezoneOffset()}
                </span>
              </div>
            </div>

            {event.eventLink && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <Link
                  href={event.eventLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span className="font-medium">Event Link</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}