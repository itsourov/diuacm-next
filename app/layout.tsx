import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Toaster2 } from 'sonner';
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from 'next-themes';
import { GoogleAnalytics } from '@next/third-parties/google'



const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'DIU ACM',
    description: 'A platform for competitive programmers',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>

            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                    scriptProps={{ 'data-cfasync': 'false' }}

                >
                    <SessionProvider>
                        <Navbar />
                        <main>
                            {children}
                        </main>
                        <Toaster />
                        <Toaster2 richColors />
                    </SessionProvider>
                </ThemeProvider>
            </body>
            <GoogleAnalytics gaId="G-CSW7LT4FFP" />

        </html>
    );
}