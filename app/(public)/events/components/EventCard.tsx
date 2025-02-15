"use client"
import { Event, AttendanceScope } from '@prisma/client';
import { isAfter, isWithinInterval } from 'date-fns';
import Link from 'next/link';
import { DateTime } from '@/lib/utils/datetime';

type EventWithNumberId = Omit<Event, 'id'> & {
    id: number;
};

type EventCardProps = {
    event: EventWithNumberId;
}

const getScopeConfig = (scope: AttendanceScope) => {
    switch (scope) {
        case 'open_for_all':
            return {
                icon: '👥',
                label: 'Open for All',
                shortLabel: 'Open for All',
                class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            };
        case 'only_girls':
            return {
                icon: '👩',
                label: 'Girls Only',
                shortLabel: 'Girls',
                class: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
            };
        case 'junior_programmers':
            return {
                icon: '🌱',
                label: 'Junior Programmers',
                shortLabel: 'Junior',
                class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
            };
    }
};

const formatEventStatus = (startDate: Date, now: Date): string => {
    const diffInMinutes = Math.floor((startDate.getTime() - now.getTime()) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
        return `in ${diffInDays} day${diffInDays > 1 ? 's' : ''}`;
    }
    if (diffInHours > 0) {
        return `in ${diffInHours} hour${diffInHours > 1 ? 's' : ''}`;
    }
    if (diffInMinutes > 0) {
        return `in ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    }
    return 'Starting soon';
};

export default function EventCard({ event }: EventCardProps) {
    const now = DateTime.getCurrentUTCTime();
    const startDate = new Date(event.startingAt);
    const endDate = new Date(event.endingAt);

    const isUpcoming = isAfter(startDate, now);
    const isRunning = isWithinInterval(now, { start: startDate, end: endDate });

    // Calculate duration in minutes for consistent display
    const durationInMinutes = Math.round(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60)
    );

    const formatDuration = () => {
        const hours = Math.floor(durationInMinutes / 60);
        const minutes = durationInMinutes % 60;
        return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
    };

    const getStatusConfig = () => {
        if (isRunning) return {
            label: 'Happening Now',
            class: 'bg-orange-500 text-white animate-pulse'
        };
        if (isUpcoming) return {
            label: formatEventStatus(startDate, now),
            class: 'bg-emerald-500 text-white'
        };
        return {
            label: 'Ended',
            class: 'bg-gray-500 text-white'
        };
    };

    const statusConfig = getStatusConfig();
    const scopeConfig = getScopeConfig(event.attendanceScope);

    return (
        <Link href={`/events/${event.id}`}
            className="block group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700
                          hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200
                          hover:shadow-lg hover:shadow-blue-500/10">
                <div className="p-3 sm:p-4">
                    {/* Title and Status Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white
                                     group-hover:text-blue-500 dark:group-hover:text-blue-400 line-clamp-1">
                            {event.title}
                        </h3>
                        <span
                            className={`self-start px-2.5 py-0.5 rounded text-xs font-medium whitespace-nowrap ${statusConfig.class}`}>
                            {statusConfig.label}
                        </span>
                    </div>

                    {/* Info Grid */}
                    <div className="grid gap-2">
                        {/* Date and Time Row */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-md text-xs font-medium
                                         bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                                <span className="mr-1 hidden sm:inline">📅</span>
                                {DateTime.formatDisplay(startDate, { format: 'local', includeTimezone: false }).split(',')[0]}
                            </span>
                            <code className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-900 rounded whitespace-nowrap">
                                {DateTime.formatDateRange(startDate, endDate)}
                            </code>
                            <code className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-900 rounded">
                                ⏱️ {formatDuration()}
                            </code>
                        </div>

                        {/* Type and Scope Row */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center px-2 sm:px-2.5 py-1 rounded-md text-xs font-medium
                                ${event.type === 'class' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                                    event.type === 'contest' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                        'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'}
                            `}>
                                <span className="mr-1">
                                    {event.type === 'class' && '📚'}
                                    {event.type === 'contest' && '🏆'}
                                    {event.type === 'other' && '👥'}
                                </span>
                                {event.type}
                            </span>

                            <span className={`inline-flex items-center px-2 sm:px-2.5 py-1 rounded-md text-xs font-medium
                                ${scopeConfig.class}`}>
                                <span className="mr-1">{scopeConfig.icon}</span>
                                <span className="hidden sm:inline">{scopeConfig.label}</span>
                                <span className="sm:hidden">{scopeConfig.shortLabel}</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Progress Indicator for Running Events */}
                {isRunning && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700
                                  rounded-b-lg overflow-hidden">
                        <div className="h-full bg-blue-500 animate-pulse"
                            style={{
                                width: `${Math.min(100,
                                    ((now.getTime() - startDate.getTime()) /
                                        (endDate.getTime() - startDate.getTime())) * 100
                                )}%`
                            }}>
                        </div>
                    </div>
                )}

                {/* Touch feedback overlay for mobile */}
                <div className="absolute inset-0 bg-gray-900 opacity-0 group-active:opacity-10
                               transition-opacity duration-200 rounded-lg md:hidden">
                </div>
            </div>
        </Link>
    );
}