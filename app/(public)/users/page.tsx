import { Suspense } from 'react';
import { getUsers } from './actions';
import UserSearchForm from './components/UserSearchForm';
import UserGrid from './components/UserGrid';
import Pagination from "@/components/shared/Pagination";
import { UsersSearchParams } from "./types";
import EmptyState from './components/EmptyState';
import { Metadata } from 'next';

type PageProps = {
    searchParams: Promise<{
        page?: string;
        query?: string;
        role?: string;
        department?: string;
    }>
}


export const metadata: Metadata = {
    title: 'Users Directory | DIU ACM',
    description: 'Connect with fellow competitive programmers from Daffodil International University. Find and follow other programmers, check their ratings and competitive programming handles.',
};

export default async function UsersPage({ searchParams }: PageProps) {
    // Await the searchParams before using them
    const resolvedParams = await searchParams;

    const { users, totalPages, currentPage } = await getUsers({
        page: resolvedParams.page ? parseInt(resolvedParams.page) : 1,
        query: resolvedParams.query,
        role: resolvedParams.role as UsersSearchParams['role'],
        department: resolvedParams.department
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero Section */}
            <section className="relative py-20 bg-gradient-to-b from-blue-50/20 to-transparent dark:from-blue-900/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Users Directory
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            Connect with fellow competitive programmers
                        </p>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Suspense fallback={<div>Loading search...</div>}>
                    <UserSearchForm />
                </Suspense>

                {users.length > 0 ? (
                    <UserGrid users={users} />
                ) : (
                    <EmptyState />
                )}

                {totalPages > 1 && (
                    <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                    />
                )}
            </div>
        </div>
    );
}
