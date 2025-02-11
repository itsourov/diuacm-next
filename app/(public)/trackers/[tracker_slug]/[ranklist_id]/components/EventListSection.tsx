"use client";

import { Event, EventRankList } from "@prisma/client";
import Link from "next/link";
import { Calendar, Clock, ArrowUpRight } from "lucide-react";
import { DateTime } from "@/lib/utils/datetime";
import { cn } from "@/lib/utils";

interface EventListSectionProps {
  events: Array<EventRankList & { event: Event }>;
}

export default function EventListSection({ events }: EventListSectionProps) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Connected Events ({events.length})
      </h2>

      <div className="grid gap-6">
        {events.map(({ event, weight }) => (
          <Link
            key={event.id.toString()}
            href={`/events/${event.id}`}
            className={cn(
              "block bg-white dark:bg-gray-800 rounded-2xl shadow-xl",
              "transition-transform duration-200 hover:scale-[1.02]"
            )}
          >
            <div className="p-6">
              {/* Event Type Badge */}
              <div className="inline-flex items-center px-3 py-1.5 rounded-lg
                bg-gradient-to-r from-blue-500/10 to-purple-500/10 
                dark:from-blue-500/20 dark:to-purple-500/20
                text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
              </div>

              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {event.title}
                  </h3>
                  
                  {event.description && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {event.description}
                    </p>
                  )}

                  <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {DateTime.formatDisplay(event.startingAt, {
                          format: 'local',
                          includeTimezone: false,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        Weight: {weight.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <ArrowUpRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {events.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No events are connected to this ranklist yet.
          </p>
        </div>
      )}
    </div>
  );
}