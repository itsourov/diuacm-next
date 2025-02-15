"use client"
import { UserListItem } from '../types';
import Image from 'next/image';
import Link from 'next/link';
import { MouseEvent } from 'react';

type UserCardProps = {
    user: UserListItem;
}

export default function UserCard({ user }: UserCardProps) {
    const getCFRatingColor = (rating: number | null) => {
        if (!rating) return 'text-gray-500 dark:text-gray-400';
        if (rating >= 2400) return 'text-[#FF0000] dark:text-[#FF0000]'; // Red
        if (rating >= 2300) return 'text-[#FF0000] dark:text-[#FF0000]'; // Red
        if (rating >= 2100) return 'text-[#FF8C00] dark:text-[#FF8C00]'; // Orange
        if (rating >= 1900) return 'text-[#AA00AA] dark:text-[#AA00AA]'; // Violet
        if (rating >= 1600) return 'text-[#0000FF] dark:text-[#0000FF]'; // Blue
        if (rating >= 1400) return 'text-[#03A89E] dark:text-[#03A89E]'; // Cyan
        if (rating >= 1200) return 'text-[#008000] dark:text-[#008000]'; // Green
        return 'text-[#808080] dark:text-[#808080]'; // Gray
    };

    const handleCFClick = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (user.codeforcesHandle) {
            window.open(`https://codeforces.com/profile/${user.codeforcesHandle}`, '_blank');
        }
    };

    return (
        <Link href={`/users/${user.username}`}
            className="block group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
                          p-5 transition-all duration-200
                          hover:border-blue-500/50 dark:hover:border-blue-500/50
                          hover:shadow-lg hover:shadow-blue-500/10
                          relative">
                <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700
                                  ring-4 ring-white dark:ring-gray-800 shadow-md
                                  group-hover:ring-blue-50 dark:group-hover:ring-blue-900/20
                                  transition-all duration-200">
                        {user.image ? (
                            <Image
                                src={user.image}
                                alt={user.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl font-semibold text-gray-500">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0 pt-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate
                                     group-hover:text-blue-500 dark:group-hover:text-blue-400
                                     transition-colors duration-200">
                            {user.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5
                                    group-hover:text-blue-500/70 dark:group-hover:text-blue-400/70">
                            @{user.username}
                        </p>
                        <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                            {user.department && (
                                <span className="text-sm text-gray-600 dark:text-gray-300 truncate
                                             bg-gray-50 dark:bg-gray-900/50 px-2.5 py-1 rounded-md
                                             border border-gray-100 dark:border-gray-800">
                                    {user.department}
                                </span>
                            )}
                            {user.studentId && (
                                <code className="text-xs px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 
                                             rounded-md font-mono text-blue-600 dark:text-blue-400
                                             border border-blue-100 dark:border-blue-800
                                             group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40
                                             transition-colors duration-200">
                                    {user.studentId}
                                </code>
                            )}
                        </div>
                    </div>
                </div>

                {/* Codeforces Info */}
                {(user.codeforcesHandle || user.maxCfRating) && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        {user.codeforcesHandle && (
                            <button
                                onClick={handleCFClick}
                                className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-500 
                                         dark:hover:text-blue-400 transition-colors"
                            >
                                {user.codeforcesHandle}
                            </button>
                        )}
                        {user.maxCfRating && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-medium uppercase tracking-wider
                                             px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-900/50
                                             text-gray-500 dark:text-gray-400">
                                    max
                                </span>
                                <span className={`text-sm font-medium ${getCFRatingColor(user.maxCfRating)}`}>
                                    {user.maxCfRating}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Focus ring for better accessibility */}
                <div className="absolute inset-0 rounded-xl pointer-events-none
                               ring-2 ring-transparent group-focus:ring-blue-500
                               transition-all duration-200"/>

                {/* Touch feedback overlay for mobile */}
                <div className="absolute inset-0 bg-gray-900 opacity-0 group-active:opacity-10
                               transition-opacity duration-200 rounded-xl md:hidden"/>
            </div>
        </Link>
    );
}
