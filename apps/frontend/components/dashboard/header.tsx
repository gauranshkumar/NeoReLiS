"use client";

import { Search, Bell, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DashboardHeader() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            // Prevent default if form submission behavior exists (though here it's just an input)
            e.preventDefault();
            // Redirect to the global search page with the query
            // Even if the page doesn't fully use it yet, this makes the box "functional"
            // encoding the query for URL safety
            if (searchQuery.trim()) {
                router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
            } else {
                router.push("/dashboard/search");
            }
        }
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#262626] bg-[#0A0A0A] px-6">
            <div className="flex-1 max-w-xl">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search across 1.2M papers, projects, or synthesis tools..."
                        className="h-10 w-full rounded-md border border-[#333] bg-[#1A1D21] pl-10 pr-12 text-sm text-gray-300 placeholder:text-gray-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <kbd className="hidden sm:inline-block rounded border border-[#333] bg-[#0A0A0A] px-1.5 text-[10px] font-medium text-gray-500">CMD</kbd>
                        <kbd className="hidden sm:inline-block rounded border border-[#333] bg-[#0A0A0A] px-1.5 text-[10px] font-medium text-gray-500">K</kbd>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 ml-6">
                <button className="relative text-gray-400 hover:text-white transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-cyan-500"></span>
                </button>
                <div className="h-6 w-px bg-[#333]"></div>
                <button className="flex items-center gap-2 rounded-md bg-cyan-500 px-4 py-2 text-sm font-bold text-black hover:bg-cyan-400 transition-colors">
                    <Plus className="h-4 w-4" />
                    NEW REVIEW
                </button>
            </div>
        </header>
    );
}
