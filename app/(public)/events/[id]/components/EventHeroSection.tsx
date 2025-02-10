"use client";

import { Event } from "@prisma/client";
import { Clock, Calendar, Timer, Users } from "lucide-react";
import { DateTime } from "@/lib/utils/datetime";

interface EventHeroSectionProps {
  event: {
    id: bigint;
    title: string;
    description: string | null;
    type: 'contest' | 'class' | 'other';
    startingAt: Date;
    endingAt: Date;
  };
  attendeeCount: number;
}

export default function EventHeroSection({ event, attendeeCount }: EventHeroSectionProps) {
  // Calculate duration in minutes
  const durationInMinutes = Math.round(
    (new Date(event.endingAt).getTime() - new Date(event.startingAt).getTime()) / (1000 * 60)
  );

  return (
    <div className="relative py-12 bg-white dark:bg-gray-900">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/20 to-transparent dark:from-blue-900/10"/>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Event Type Badge */}
          <div className="inline-flex items-center px-4 py-2.5 rounded-2xl
            bg-gradient-to-r from-blue-500/10 to-purple-500/10 
            dark:from-blue-500/20 dark:to-purple-500/20
            backdrop-blur-xl shadow-lg shadow-blue-500/10 dark:shadow-blue-500/20
            border border-blue-100/20 dark:border-blue-500/20
            text-blue-600 dark:text-blue-400 font-medium">
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse"/>
              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
            </div>
          </div>

          {/* Title and Description */}
          <div className="space-y-4 max-w-4xl">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
              {event.title}
            </h1>
            {event.description && (
              <div 
                className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            )}
          </div>

          {/* Event Info Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
              <Calendar className="w-8 h-8 text-blue-500 mb-2"/>
              <h3 className="font-bold text-gray-900 dark:text-white">Date</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {DateTime.formatDisplay(event.startingAt, { 
                  format: 'local',
                  includeTimezone: false 
                }).split(',')[0]}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
              <Clock className="w-8 h-8 text-purple-500 mb-2"/>
              <h3 className="font-bold text-gray-900 dark:text-white">Time</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {DateTime.formatDateRange(
                  new Date(event.startingAt),
                  new Date(event.endingAt)
                )}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
              <Timer className="w-8 h-8 text-green-500 mb-2"/>
              <h3 className="font-bold text-gray-900 dark:text-white">Duration</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {durationInMinutes >= 60 
                  ? `${Math.floor(durationInMinutes / 60)}h ${durationInMinutes % 60}m`
                  : `${durationInMinutes}m`
                }
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
              <Users className="w-8 h-8 text-amber-500 mb-2"/>
              <h3 className="font-bold text-gray-900 dark:text-white">Attendees</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {attendeeCount} participant{attendeeCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}