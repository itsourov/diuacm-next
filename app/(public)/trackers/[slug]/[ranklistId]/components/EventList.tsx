'use client';

import { Event } from "@prisma/client";
import { DateTime } from "@/lib/utils/datetime";
import Link from "next/link";
import { useState } from 'react';
import { Calendar, Scale, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

interface EventListProps {
  events: {
    event: Event;
    weight: number;
  }[];
}

export default function EventList({ events }: EventListProps) {
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const displayedEvents = events.slice(0, displayCount);
  const hasMore = displayCount < events.length;

  return (
    <div className="space-y-4">
      {displayedEvents.map(({ event, weight }) => (
        <div 
          key={event.id.toString()}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Link
                  href={`/events/${event.id}`}
                  className="group inline-flex items-center gap-2"
                >
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white 
                               group-hover:text-blue-500 dark:group-hover:text-blue-400 truncate">
                    {event.title}
                  </h3>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 
                                         dark:text-gray-500 dark:group-hover:text-blue-400" />
                </Link>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{DateTime.formatDisplay(event.startingAt, { format: 'utc' })}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Scale className="w-4 h-4" />
                    <span>Weight: {weight}</span>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  event.type === 'contest' && "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
                  event.type === 'class' && "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
                  event.type === 'other' && "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400"
                )}>
                  {event.type}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setDisplayCount(prev => prev + ITEMS_PER_PAGE)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg",
              "bg-white dark:bg-gray-800",
              "border border-gray-200 dark:border-gray-700",
              "text-gray-900 dark:text-white",
              "hover:bg-gray-50 dark:hover:bg-gray-700",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/30"
            )}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}