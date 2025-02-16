import Link from 'next/link';
import { UserX } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="max-w-md mx-auto px-4 py-8 text-center">
                <UserX className="w-16 h-16 mx-auto text-gray-400" />
                <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
                    User Not Found
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    The user you&apos;re looking for doesn&apos;t exist or may have been removed.
                </p>
                <Link
                    href="/users"
                    className="mt-6 inline-flex items-center justify-center px-4 py-2
                             bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                             transition-colors duration-200"
                >
                    Return to Users
                </Link>
            </div>
        </div>
    );
}
