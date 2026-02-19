"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import {
    LayoutGrid,
    Search,
    Layers,
    Library,
    Settings,
    User,
    LogOut,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/use-auth";
import { projectApi, Project } from "@/lib/api";

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, isAuthenticated } = useAuth();
    const [recentProjects, setRecentProjects] = useState<Project[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(false);

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    // Fetch recent projects for the sidebar
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchProjects = async () => {
            setProjectsLoading(true);
            const res = await projectApi.list();
            if (res.data) {
                // Show up to 5 most recent projects in sidebar
                setRecentProjects(res.data.projects.slice(0, 5));
            }
            setProjectsLoading(false);
        };

        fetchProjects();
    }, [isAuthenticated]);

    const navItems = [
        { name: "Overview", href: "/dashboard", icon: LayoutGrid },
        { name: "Projects", href: "/dashboard/projects", icon: LayoutGrid },
        { name: "Global Search", href: "/dashboard/search", icon: Search },
        { name: "Synthesis", href: "/dashboard/synthesis", icon: Layers },
        { name: "Library", href: "/dashboard/library", icon: Library },
    ];

    const statusColors: Record<string, string> = {
        PUBLISHED: "bg-cyan-500",
        DRAFT: "bg-yellow-500",
        ARCHIVED: "bg-green-500",
    };

    return (
        <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-[#262626] bg-[#0A0A0A] flex flex-col">
            <div className="flex h-16 items-center border-b border-[#262626] px-6">
                <Logo className="scale-90 origin-left" />
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                                    isActive
                                        ? "bg-[#1A1D21] text-cyan-500 font-medium"
                                        : "text-gray-400 hover:bg-[#1A1D21] hover:text-white"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div>
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Workspace
                    </h3>
                    <nav className="space-y-1">
                        {projectsLoading ? (
                            <div className="flex items-center gap-3 px-3 py-2">
                                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                                <span className="text-xs text-gray-500">Loading...</span>
                            </div>
                        ) : recentProjects.length === 0 ? (
                            <div className="px-3 py-2">
                                <p className="text-xs text-gray-600">No projects yet</p>
                            </div>
                        ) : (
                            recentProjects.map((project) => (
                                <Link
                                    key={project.id}
                                    href={`/projects/${project.id}`}
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 hover:bg-[#1A1D21] hover:text-white transition-colors"
                                >
                                    <span
                                        className={`w-2 h-2 rounded-full ${statusColors[project.status] || "bg-gray-500"}`}
                                    ></span>
                                    <span className="truncate text-sm">{project.title}</span>
                                </Link>
                            ))
                        )}
                    </nav>
                </div>
            </div>

            <div className="border-t border-[#262626] p-4">
                {isAuthenticated && user ? (
                    <div className="flex items-center gap-2">
                        <Link
                            href="/dashboard/settings"
                            className={cn(
                                "flex items-center flex-1 gap-3 p-2 rounded-lg transition-colors text-left group",
                                pathname === "/dashboard/settings"
                                    ? "bg-[#1A1D21]"
                                    : "hover:bg-[#1A1D21]"
                            )}
                        >
                            <div className="w-8 h-8 rounded-full bg-cyan-900 flex items-center justify-center text-cyan-200">
                                <User className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p
                                    className={cn(
                                        "text-sm font-medium group-hover:text-cyan-400 truncate",
                                        pathname === "/dashboard/settings"
                                            ? "text-cyan-400"
                                            : "text-white"
                                    )}
                                >
                                    {user.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                            <Settings
                                className={cn(
                                    "w-4 h-4 group-hover:text-white",
                                    pathname === "/dashboard/settings"
                                        ? "text-white"
                                        : "text-gray-500"
                                )}
                            />
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-[#1A1D21] transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <Link
                        href="/login"
                        className="flex items-center gap-3 p-2 rounded-lg text-gray-400 hover:bg-[#1A1D21] hover:text-white transition-colors"
                    >
                        <User className="w-5 h-5" />
                        <span className="text-sm">Sign In</span>
                    </Link>
                )}
            </div>
        </aside>
    );
}
