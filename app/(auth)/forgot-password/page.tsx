import Link from 'next/link';

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Password Recovery
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Follow these steps to regain access to your account
                        </p>
                    </div>

                    <div className="space-y-6 text-gray-700 dark:text-gray-300">
                        <ol className="list-decimal list-inside space-y-4">
                            <li>Click on the Google login button on the login page</li>
                            <li>Use your DIU email address (@diu.edu.bd or @s.diu.edu.bd) to sign in</li>
                            <li>Once logged in, navigate to your account settings</li>
                            <li>Look for the password change option in your account settings</li>
                            <li>Set your new password</li>
                        </ol>

                        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mt-6">
                            <p className="text-blue-800 dark:text-blue-200 text-sm">
                                Note: This method only works if you have previously registered with your DIU email address.
                            </p>
                        </div>

                        <div className="flex flex-col space-y-4 mt-8">


                            <Link
                                href="/login"
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg text-center"
                            >
                                Continue to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
