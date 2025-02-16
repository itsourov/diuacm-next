import { getUser } from './actions';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
    params: Promise<{
        username: string;
    }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function UserDetailsPage({ params }: PageProps) {
    // Await and resolve params before using
    const resolvedParams = await params;
    const user = await getUser(resolvedParams.username);

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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
            {/* Back Button */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <Link href="/users"
                    className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 
                             hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Users
                </Link>
            </div>

            {/* Profile Card */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
                              shadow-sm overflow-hidden">
                    {/* Cover Image */}
                    <div className="h-32 bg-gradient-to-r from-blue-400 to-blue-600" />

                    {/* Profile Content */}
                    <div className="relative px-4 sm:px-6 lg:px-8 pb-8">
                        {/* Avatar */}
                        <div className="relative -mt-16 mb-4">
                            <div className="relative w-32 h-32 mx-auto rounded-xl overflow-hidden ring-8 ring-white dark:ring-gray-800
                                          bg-gray-100 dark:bg-gray-700">
                                {user.image ? (
                                    <Image
                                        src={user.image}
                                        alt={user.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-5xl font-semibold text-gray-500">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {user.name}
                            </h1>
                            <p className="mt-1 text-gray-500 dark:text-gray-400">
                                @{user.username}
                            </p>

                            {/* Department and Student ID */}
                            {(user.department || user.studentId) && (
                                <div className="mt-4 flex items-center justify-center gap-3">
                                    {user.department && (
                                        <span className="px-3 py-1 text-sm rounded-lg
                                                     bg-gray-100 dark:bg-gray-900
                                                     text-gray-700 dark:text-gray-300">
                                            {user.department}
                                        </span>
                                    )}
                                    {user.studentId && (
                                        <code className="px-3 py-1 text-sm rounded-lg font-mono
                                                     bg-blue-50 dark:bg-blue-900/20
                                                     text-blue-700 dark:text-blue-300
                                                     border border-blue-100 dark:border-blue-800">
                                            {user.studentId}
                                        </code>
                                    )}
                                </div>
                            )}

                            {/* Programming Handles */}
                            <div className="mt-6 grid gap-4 max-w-2xl mx-auto">
                                {user.codeforcesHandle && (
                                    <div className="flex items-center justify-between p-4 rounded-lg
                                                  bg-gray-50 dark:bg-gray-900/50
                                                  border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">🏆</span>
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Codeforces
                                                </p>
                                                <a href={`https://codeforces.com/profile/${user.codeforcesHandle}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                                    {user.codeforcesHandle}
                                                </a>
                                            </div>
                                        </div>
                                        {user.maxCfRating && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs uppercase tracking-wider text-gray-500">
                                                    Max Rating
                                                </span>
                                                <span className={`text-sm font-medium ${getCFRatingColor(user.maxCfRating)}`}>
                                                    {user.maxCfRating}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {user.atcoderHandle && (
                                    <div className="flex items-center gap-3 p-4 rounded-lg
                                                  bg-gray-50 dark:bg-gray-900/50
                                                  border border-gray-200 dark:border-gray-700">
                                        <span className="text-lg">🎯</span>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                AtCoder
                                            </p>
                                            <a href={`https://atcoder.jp/users/${user.atcoderHandle}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                                {user.atcoderHandle}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {user.vjudgeHandle && (
                                    <div className="flex items-center gap-3 p-4 rounded-lg
                                                  bg-gray-50 dark:bg-gray-900/50
                                                  border border-gray-200 dark:border-gray-700">
                                        <span className="text-lg">⚡</span>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                VJudge
                                            </p>
                                            <a href={`https://vjudge.net/user/${user.vjudgeHandle}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                                {user.vjudgeHandle}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
