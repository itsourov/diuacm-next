"use client"
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { useSearchParams } from 'next/navigation';

interface SocialLoginButtonProps {
    provider: 'google';
    label: string;
}

const GoogleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M21.805 10.023h-9.82v3.98h5.66c-.24 1.26-.94 2.32-1.98 3.02v2.5h3.18c1.86-1.72 2.94-4.26 2.94-7.18 0-.54-.05-1.08-.12-1.6z"
            fill="#4285F4" />
        <path
            d="M12.005 22c2.7 0 4.96-.9 6.61-2.48l-3.18-2.5c-.88.6-1.98.96-3.43.96-2.64 0-4.88-1.78-5.68-4.18H3.005v2.6c1.66 3.3 5.02 5.5 9 5.5z"
            fill="#34A853" />
        <path
            d="M6.325 13.84c-.2-.6-.32-1.24-.32-1.9s.12-1.3.32-1.9v-2.6h-3.32c-.68 1.34-1.08 2.84-1.08 4.5s.4 3.16 1.08 4.5l3.32-2.6z"
            fill="#FBBC05" />
        <path
            d="M12.005 7.5c1.48 0 2.8.5 3.84 1.48l2.86-2.86c-1.66-1.56-3.92-2.62-6.7-2.62-3.98 0-7.34 2.2-9 5.5l3.32 2.6c.8-2.4 3.04-4.18 5.68-4.18z"
            fill="#EA4335" />
    </svg>
);

export default function SocialLoginButton({ provider, label }: SocialLoginButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const handleClick = async () => {
        try {
            setIsLoading(true);
            await signIn(provider, {
                callbackUrl,
            });
        } catch (error) {
            toast.error('Social login error:' + error);
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
            {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <>
                    <GoogleIcon />
                    <span className="ml-2">{label}</span>
                </>
            )}
        </button>
    );
}