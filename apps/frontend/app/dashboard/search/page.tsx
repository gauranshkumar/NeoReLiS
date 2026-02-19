"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, BookOpen, Users, ChevronRight, Share2, Bell, Bookmark, MoreHorizontal, Loader2 } from "lucide-react";
import { paperApi, Paper } from "@/lib/api";
import { useAuth } from "@/lib/hooks/use-auth";

export default function GlobalSearchPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                </div>
            }
        >
            <GlobalSearchContent />
        </Suspense>
    );
}

function GlobalSearchContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q") || "";
    const { isAuthenticated } = useAuth();

    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<Paper[]>([]);
    const [totalResults, setTotalResults] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [page, setPage] = useState(1);
    const limit = 10;

    // Search when query changes (debounced) or page changes
    useEffect(() => {
        if (!query.trim() || !isAuthenticated) {
            setResults([]);
            setTotalResults(0);
            setSearched(false);
            return;
        }

        const timer = setTimeout(() => {
            performSearch();
        }, 400);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, page, isAuthenticated]);

    // Sync from URL search param
    useEffect(() => {
        const q = searchParams.get("q");
        if (q && q !== query) {
            setQuery(q);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const performSearch = async () => {
        setLoading(true);
        setSearched(true);
        // Search across all projects — the backend papers endpoint supports a search param
        const res = await paperApi.list({
            search: query,
            page,
            limit,
        });
        if (res.data) {
            setResults(res.data.papers || []);
            setTotalResults(res.data.total || 0);
        } else {
            setResults([]);
            setTotalResults(0);
        }
        setLoading(false);
    };

    const totalPages = Math.ceil(totalResults / limit) || 1;

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Search className="w-5 h-5 text-cyan-500" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search papers by title, author, DOI..."
                        className="flex-1 text-lg font-medium text-white bg-transparent border-none outline-none placeholder:text-gray-600"
                    />
                    <span className="ml-auto text-xs text-gray-500 bg-[#1A1D21] px-2 py-1 rounded border border-[#333]">
                        CMD + K
                    </span>
                </div>

                {/* Filters Bar */}
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#262626]">
                    <button className="bg-cyan-500 rounded px-3 py-1.5 text-xs font-bold text-black flex items-center gap-2">
                        All Time <ChevronRight className="w-3 h-3 rotate-90" />
                    </button>
                    <button className="bg-[#1A1D21] border border-[#333] rounded px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-white flex items-center gap-2">
                        <BookOpen className="w-3 h-3" /> Journal <ChevronRight className="w-3 h-3 rotate-90" />
                    </button>
                    <button className="bg-[#1A1D21] border border-[#333] rounded px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-white flex items-center gap-2">
                        <Users className="w-3 h-3" /> Author <ChevronRight className="w-3 h-3 rotate-90" />
                    </button>
                    <button className="bg-[#1A1D21] border border-[#333] rounded px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-white flex items-center gap-2">
                        DOI
                    </button>
                    <span className="ml-auto text-xs text-gray-500">
                        {searched ? `${totalResults} result${totalResults !== 1 ? "s" : ""} found` : ""}
                    </span>
                </div>

                {/* Results */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                        </div>
                    ) : !searched ? (
                        <div className="text-center py-16">
                            <Search className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500 text-sm">
                                Start typing to search across your papers and projects.
                            </p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-gray-400 text-sm mb-2">
                                No results found for &quot;{query}&quot;
                            </p>
                            <p className="text-gray-600 text-xs">
                                Try different keywords or broaden your search.
                            </p>
                        </div>
                    ) : (
                        results.map((paper) => (
                            <SearchResult
                                key={paper.id}
                                journal={paper.source || "UNKNOWN"}
                                year={paper.year ? String(paper.year) : "—"}
                                doi={paper.doi || "—"}
                                title={paper.title}
                                snippet={paper.abstract || "No abstract available."}
                                authors={
                                    paper.authors && paper.authors.length > 0
                                        ? paper.authors
                                            .map((a) => `${a.firstName} ${a.lastName}`)
                                            .join(", ")
                                        : "Unknown"
                                }
                            />
                        ))
                    )}
                </div>

                {/* Pagination */}
                {searched && totalResults > limit && (
                    <div className="flex justify-center mt-8 gap-2 pb-8">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="w-8 h-8 flex items-center justify-center rounded bg-[#1A1D21] border border-[#333] text-gray-400 hover:text-white disabled:opacity-30"
                        >
                            <ChevronRight className="w-4 h-4 rotate-180" />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={`w-8 h-8 flex items-center justify-center rounded font-bold ${page === pageNum
                                        ? "bg-cyan-500 text-black"
                                        : "bg-transparent text-gray-400 hover:text-white"
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        {totalPages > 5 && (
                            <span className="w-8 h-8 flex items-center justify-center text-gray-500">
                                ...
                            </span>
                        )}
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            className="w-8 h-8 flex items-center justify-center rounded bg-[#1A1D21] border border-[#333] text-gray-400 hover:text-white disabled:opacity-30"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Right Sidebar */}
            <div className="w-80 border-l border-[#262626] p-6 bg-[#0A0A0A]">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">
                    REFINE RESULTS
                </h3>

                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-white">Publication Date</span>
                        <span className="text-cyan-500 text-xs font-bold">All Years</span>
                    </div>
                    <div className="h-1 bg-[#333] rounded-full relative">
                        <div className="absolute left-0 right-0 h-full bg-cyan-500 rounded-full"></div>
                    </div>
                </div>

                <div className="mb-8">
                    <span className="text-sm font-bold text-white mb-4 block">Source Filters</span>
                    <div className="space-y-2 text-sm text-gray-400">
                        <p className="text-xs text-gray-600">
                            Filters will appear based on available data in your projects.
                        </p>
                    </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-[#262626]">
                    <button className="w-full bg-white hover:bg-gray-200 text-black font-bold py-2.5 rounded flex items-center justify-center gap-2 transition-colors">
                        <Bell className="w-4 h-4" /> Set Search Alert
                    </button>
                    <button className="w-full bg-[#1A1D21] border border-[#333] hover:bg-[#222] text-white font-bold py-2.5 rounded flex items-center justify-center gap-2 transition-colors">
                        <Share2 className="w-4 h-4" /> Share Search
                    </button>
                </div>
            </div>
        </div>
    );
}

function SearchResult({
    journal,
    year,
    doi,
    title,
    snippet,
    authors,
}: {
    journal: string;
    year: string;
    doi: string;
    title: string;
    snippet: string;
    authors: string;
}) {
    return (
        <div className="bg-[#0F1115] border border-[#262626] rounded-xl p-6 hover:border-cyan-500/20 transition-colors flex gap-6">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 text-xs">
                    <span className="font-bold px-2 py-0.5 bg-cyan-950/30 text-cyan-400 rounded uppercase tracking-wider">
                        {journal}
                    </span>
                    <span className="text-gray-500">
                        {year}
                        {doi !== "—" ? ` • DOI: ${doi}` : ""}
                    </span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2 leading-tight hover:text-cyan-400 cursor-pointer">
                    {title}
                </h2>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2">{snippet}</p>
                <div className="flex items-center gap-6 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                        <Users className="w-3 h-3" /> {authors}
                    </span>
                </div>
            </div>
            <div className="flex flex-col justify-end items-end gap-2 min-w-[120px]">
                <div className="flex items-center gap-2">
                    <button className="bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold px-4 py-2 rounded flex items-center gap-2 transition-colors">
                        <Users className="w-3 h-3" /> View
                    </button>
                    <button className="p-2 rounded bg-[#1A1D21] border border-[#333] text-gray-400 hover:text-white transition-colors">
                        <Bookmark className="w-3 h-3" />
                    </button>
                    <button className="p-2 rounded bg-[#1A1D21] border border-[#333] text-gray-400 hover:text-white transition-colors">
                        <MoreHorizontal className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}
