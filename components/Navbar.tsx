'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';
import {
    Menu,
    X,
    Sun,
    Moon,
    Home,
    Calendar,
    BookOpen,
    Image as Gallery,
    Terminal,
    LogOut,
    User as UserIcon,
    Settings,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { toast } from "sonner";

// Types moved to separate types.ts file for better organization
interface NavLink {
    name: string;
    href: string;
    icon: React.ElementType;
}

interface UserNavItem {
    name: string;
    href?: string;
    onClick?: () => Promise<void>;
    icon: React.ElementType;
    variant?: 'danger';
}

// Constants moved to separate constants.ts file
const navLinks: NavLink[] = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Trackers', href: '/trackers', icon: Calendar },
    { name: 'Blog', href: '/blog', icon: BookOpen },
    { name: 'Gallery', href: '/gallery', icon: Gallery },
];

// Extracted menu item component for reusability
const MenuItem = ({
                      href,
                      icon: Icon,
                      name,
                      isActive,
                      onClick,
                      variant
                  }: {
    href?: string;
    icon: React.ElementType;
    name: string;
    isActive?: boolean;
    onClick?: () => void;
    variant?: 'danger';
}) => {
    const baseStyles = `
        flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium
        transition-colors duration-150 ease-in-out
    `;

    const variantStyles = {
        default: isActive
            ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
        danger: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
    };

    const styles = `${baseStyles} ${variantStyles[variant || 'default']}`;

    if (href) {
        return (
            <Link href={href} className={styles} onClick={onClick}>
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{name}</span>
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={styles}>
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span>{name}</span>
        </button>
    );
};

export default function Navbar() {
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { theme, setTheme } = useTheme();
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => setMounted(true), []);

    // Memoized click outside handler
    const handleClickOutside = useCallback((event: MouseEvent) => {
        const target = event.target as Node;
        const mobileMenu = document.getElementById('mobile-menu');
        const menuButton = document.getElementById('menu-button');
        const userMenu = document.getElementById('user-menu');
        const userButton = document.getElementById('user-button');

        if (mobileMenu && menuButton &&
            !mobileMenu.contains(target) &&
            !menuButton.contains(target)) {
            setIsOpen(false);
        }

        if (userMenu && userButton &&
            !userMenu.contains(target) &&
            !userButton.contains(target)) {
            setShowUserMenu(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [handleClickOutside]);

    // Close menus when route changes
    useEffect(() => {
        setIsOpen(false);
        setShowUserMenu(false);
    }, [pathname]);

    const handleSignOut = async () => {
        try {
            await signOut({ redirect: false });
            router.refresh();
            toast.success('Signed out successfully');
        } catch (error) {
            toast.error('Failed to sign out');
        }
    };

    const userNavItems: UserNavItem[] = [
        { name: 'Profile', href: '/', icon: UserIcon },
        { name: 'Manage Account', href: '/manage-account', icon: Settings },
        {
            name: 'Sign out',
            icon: LogOut,
            onClick: handleSignOut,
            variant: 'danger'
        },
    ];

    const ThemeToggle = () => (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
            {mounted && (theme === 'dark'
                    ? <Sun className="h-5 w-5" aria-hidden="true" />
                    : <Moon className="h-5 w-5" aria-hidden="true" />
            )}
        </button>
    );

    const UserAvatar = () => (
        session?.user?.image ? (
            <Image
                src={session.user.image}
                alt={session.user.name || 'Profile picture'}
                width={28}
                height={28}
                className="rounded-full"
                priority
            />
        ) : (
            <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                {session?.user?.name?.[0] || 'U'}
            </div>
        )
    );

    return (
        <nav
            className="fixed w-full z-50 top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
            role="navigation"
            aria-label="Main navigation"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
                        aria-label="DIUACM Home"
                    >
                        <Terminal className="h-6 w-6 text-blue-600 dark:text-blue-500" aria-hidden="true" />
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-500">
                            DIUACM
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <MenuItem
                                key={link.name}
                                {...link}
                                isActive={pathname === link.href}
                            />
                        ))}
                    </div>

                    {/* Desktop Right Section */}
                    <div className="hidden md:flex items-center space-x-4">
                        <ThemeToggle />

                        {status === 'loading' ? (
                            <div className="h-8 w-8 rounded-md bg-gray-200 dark:bg-gray-800 animate-pulse" />
                        ) : !session ? (
                            <Link
                                href="/login"
                                className="
                                    bg-blue-600 hover:bg-blue-700
                                    text-white px-4 py-2 rounded-md
                                    transition-colors duration-150
                                    text-sm font-medium
                                "
                            >
                                Sign In
                            </Link>
                        ) : (
                            <div className="relative">
                                <button
                                    id="user-button"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    aria-expanded={showUserMenu}
                                    aria-haspopup="true"
                                    aria-label="User menu"
                                >
                                    <UserAvatar />
                                </button>

                                {showUserMenu && (
                                    <div
                                        id="user-menu"
                                        className="
                                            absolute right-0 mt-2 w-48 py-1
                                            bg-white dark:bg-gray-900
                                            rounded-md shadow-lg
                                            border border-gray-200 dark:border-gray-700
                                            z-50
                                        "
                                        role="menu"
                                        aria-orientation="vertical"
                                        aria-labelledby="user-button"
                                    >
                                        {userNavItems.map((item) => (
                                            <MenuItem
                                                key={item.name}
                                                {...item}
                                                onClick={() => {
                                                    item.onClick?.();
                                                    setShowUserMenu(false);
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        id="menu-button"
                        onClick={() => setIsOpen(true)}
                        className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                        aria-expanded={isOpen}
                        aria-haspopup="true"
                        aria-label="Open menu"
                    >
                        <Menu className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />

                    <div
                        id="mobile-menu"
                        className="
                            fixed top-0 right-0 w-[280px] h-full
                            bg-white dark:bg-gray-900
                            z-50 transform transition-transform duration-200 ease-in-out
                            md:hidden overflow-y-auto
                        "
                        role="dialog"
                        aria-modal="true"
                        aria-label="Mobile menu"
                    >
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                                aria-label="Close menu"
                            >
                                <X className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>

                        {session && (
                            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                                <div className="flex items-center space-x-3">
                                    <UserAvatar />
                                    <div className="flex-1 min-w-0">
                                        {session.user?.name && (
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {session.user.name}
                                            </p>
                                        )}
                                        {session.user?.email && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                {session.user.email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="px-2 py-3">
                            {navLinks.map((link) => (
                                <MenuItem
                                    key={link.name}
                                    {...link}
                                    isActive={pathname === link.href}
                                    onClick={() => setIsOpen(false)}
                                />
                            ))}

                            {session && (
                                <>
                                    {userNavItems.map((item) => (
                                        <MenuItem
                                            key={item.name}
                                            {...item}
                                            onClick={() => {
                                                item.onClick?.();
                                                setIsOpen(false);
                                            }}
                                        />
                                    ))}
                                </>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Theme</span>
                                <ThemeToggle />
                            </div>

                            {!session && (
                                <Link
                                    href="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="
                                        mt-4 w-full bg-blue-600 hover:bg-blue-700
                                        text-white px-4 py-2 rounded-md
                                        transition-colors duration-150
                                        flex items-center justify-center
                                        text-sm font-medium
                                    "
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </>
            )}
        </nav>
    );
}