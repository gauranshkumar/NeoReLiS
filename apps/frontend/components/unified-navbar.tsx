"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, Plus, User, LogOut, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/lib/hooks/use-auth";
import { reportingApi } from "@/lib/api";

export function UnifiedNavbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const userMenuRef = useRef<HTMLDivElement>(null);
    
    const [searchQuery, setSearchQuery] = useState("");
    const [paperCount, setPaperCount] = useState<number | null>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Determine which variant to show
    const isDashboardRoute = pathname?.startsWith("/dashboard");
    const isLoginRoute = pathname === "/login";
    const isSignupRoute = pathname === "/signup";
    const isAuthRoute = isLoginRoute || isSignupRoute;

    // Fetch paper stats for dashboard search placeholder
    useEffect(() => {
        if (!isAuthenticated || !isDashboardRoute) return;
        const fetchStats = async () => {
            const res = await reportingApi.getProjectStats();
            if (res.data?.papers?.total) {
                setPaperCount(res.data.papers.total);
            }
        };
        fetchStats();
    }, [isAuthenticated, isDashboardRoute]);

    // Close user menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        }
        
        if (showUserMenu) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
    }, [showUserMenu]);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (searchQuery.trim()) {
                router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
            } else {
                router.push("/dashboard/search");
            }
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push("/");
        setShowUserMenu(false);
    };

    const placeholderText =
        paperCount !== null && paperCount > 0
            ? `Search across ${paperCount.toLocaleString()} papers, projects, or synthesis tools...`
            : "Search papers, projects, or synthesis tools...";

    // Dashboard Variant - Search bar with notifications and NEW REVIEW button
    if (isDashboardRoute) {
        return (
            <header className="fixed top-0 left-64 right-0 z-30 flex h-16 items-center justify-between border-b border-[#262626] bg-[#0A0A0A] px-6">
                <div className="flex-1 max-w-xl">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder={placeholderText}
                            className="h-10 w-full rounded-md border border-[#333] bg-[#1A1D21] pl-10 pr-12 text-sm text-gray-300 placeholder:text-gray-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <kbd className="hidden sm:inline-block rounded border border-[#333] bg-[#0A0A0A] px-1.5 text-[10px] font-medium text-gray-500">
                                CMD
                            </kbd>
                            <kbd className="hidden sm:inline-block rounded border border-[#333] bg-[#0A0A0A] px-1.5 text-[10px] font-medium text-gray-500">
                                K
                            </kbd>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 ml-6">
                    <button className="relative text-gray-400 hover:text-white transition-colors">
                        <Bell className="h-5 w-5" />
                        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-cyan-500"></span>
                    </button>
                    <div className="h-6 w-px bg-[#333]"></div>
                    <button
                        onClick={() => router.push("/dashboard/projects")}
                        className="flex items-center gap-2 rounded-md bg-cyan-500 px-4 py-2 text-sm font-bold text-black hover:bg-cyan-400 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        NEW REVIEW
                    </button>
                </div>
            </header>
        );
    }

    // Auth Pages Variant - Simple header with context-aware button
    if (isAuthRoute) {
        return (
            <header className="fixed top-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#262626] bg-[#0A0A0A] px-6">
                <div className="flex items-center gap-2">
                    <Logo />
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">
                        {isLoginRoute ? "Need an account?" : "Already have an account?"}
                    </span>
                    <Link
                        href={isLoginRoute ? "/signup" : "/login"}
                        className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-cyan-400"
                    >
                        {isLoginRoute ? "Create Account" : "Sign In"}
                    </Link>
                </div>
            </header>
        );
    }

    // Public Pages Variant - Authenticated User
    if (isAuthenticated && user) {
        return (
            <header className="fixed top-0 left-0 right-0 z-50 flex h-20 w-full items-center justify-between border-b border-[#262626] bg-[#0A0A0A]/80 backdrop-blur-md px-6 md:px-12">
                <div className="flex items-center gap-2">
                    <Logo />
                </div>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                    <Link href="/#platform" className="hover:text-white transition-colors">Platform</Link>
                    <Link href="/#methodology" className="hover:text-white transition-colors">Methodology</Link>
                    <Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link>
                    <Link href="/#resources" className="hover:text-white transition-colors">Resources</Link>
                </nav>

                <div className="flex items-center gap-4">
                    {/* User Menu */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        >
                            <div className="h-8 w-8 rounded-full bg-cyan-500 flex items-center justify-center text-black font-semibold">
                                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                            </div>
                            <span className="hidden md:inline">{user.name || user.username}</span>
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-56 rounded-md border border-[#262626] bg-[#0A0A0A] shadow-lg overflow-hidden">
                                <div className="px-4 py-3 border-b border-[#262626]">
                                    <p className="text-sm font-medium text-white">{user.name || user.username}</p>
                                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                </div>
                                <div className="py-1">
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#1A1D21] hover:text-white transition-colors"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <User className="h-4 w-4" />
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/dashboard/settings"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#1A1D21] hover:text-white transition-colors"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <Settings className="h-4 w-4" />
                                        Settings
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#1A1D21] hover:text-white transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Log Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <Link
                        href="/dashboard"
                        className="rounded-md bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-cyan-400"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </header>
        );
    }

    // Public Pages Variant - Not Authenticated (Default)
    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex h-20 w-full items-center justify-between border-b border-[#262626] bg-[#0A0A0A]/80 backdrop-blur-md px-6 md:px-12">
            <div className="flex items-center gap-2">
                <Logo />
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                <Link href="/#platform" className="hover:text-white transition-colors">Platform</Link>
                <Link href="/#methodology" className="hover:text-white transition-colors">Methodology</Link>
                <Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link>
                <Link href="/#resources" className="hover:text-white transition-colors">Resources</Link>
            </nav>

            <div className="flex items-center gap-4">
                <Link
                    href="/login"
                    className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                    Log In
                </Link>
                <Link
                    href="/signup"
                    className="rounded-md bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-cyan-400"
                >
                    Get Started
                </Link>
            </div>
        </header>
    );
}
