"use client"

import { Suspense } from "react"
import ErrorContent from "./error-content"

export default function AuthErrorPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
            <Suspense
                fallback={
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                }
            >
                <ErrorContent />
            </Suspense>
        </div>
    )
}
