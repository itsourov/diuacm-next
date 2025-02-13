// app/(auth)/register/page.tsx
import Link from 'next/link';
import SocialLoginButton from "@/app/(auth)/components/SocialLoginButton";

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full my-10">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Create an Account
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Join our community using your DIU email
                        </p>
                    </div>

                    {/* Information Message */}
                    <div className="mb-8 space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                                Important Registration Instructions:
                            </h3>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200">
                                <li>Use your DIU email address (@diu.edu.bd or @s.diu.edu.bd)</li>
                                <li>Set a password for you account after creating a new account.  </li>
                                <li>Keep your credentials safe - you&apos;ll need them for contest attendance. </li>
                            </ol>
                        </div>
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                <strong>Note:</strong> Personal Gmail accounts are not accepted. You must use your official DIU email address for registration.
                            </p>
                        </div>
                    </div>

                    {/* Social Login Button */}
                    <div className="w-full">
                        <SocialLoginButton
                            provider="google"
                            label="Register using Google"
                        />
                    </div>

                    {/* Sign In Link */}
                    <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}