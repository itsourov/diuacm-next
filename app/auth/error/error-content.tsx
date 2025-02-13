"use client"

import { useSearchParams } from "next/navigation"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { errorMessages } from "./error-messages"

export default function ErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get("error") || "Default"
    const { title, message } = errorMessages[error as keyof typeof errorMessages] || errorMessages.Default

    return (
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
            <div className="flex flex-col items-center">
                <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3 mb-4">
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {title}
                </h2>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                    {message}
                </p>
                <div className="flex gap-4">
                    <Link
                        href="/login"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        Try Again
                    </Link>
                    <Link
                        href="/"
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg transition-colors"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Need help?{" "}
                    <a
                        href="mailto:support@example.com"
                        className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                        Contact Support
                    </a>
                </p>
            </div>
        </div>
    )
}
