"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, ArrowUp, Grid, List, Plus, FileText, Bookmark, MessageSquare, Loader2 } from "lucide-react";
import { paperApi, Paper, projectApi, Project } from "@/lib/api";
import { useAuth } from "@/lib/hooks/use-auth";

type ViewMode = "grid" | "list";
type SortKey = "year" | "title" | "createdAt";

export default function LibraryPage() {
    const { isAuthenticated } = useAuth();
    const [papers, setPapers] = useState<Paper[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [sortKey, setSortKey] = useState<SortKey>("createdAt");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 12;

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, page, searchQuery]);

    const fetchData = async () => {
        setLoading(true);

        // Fetch projects to get all project IDs, then fetch papers
        const projRes = await projectApi.list();
        if (projRes.data) {
            setProjects(projRes.data.projects);
        }

        // Fetch papers across all projects
        const papersRes = await paperApi.list({
            page,
            limit,
            search: searchQuery || undefined,
        });

        if (papersRes.data) {
            setPapers(papersRes.data.papers || []);
            setTotal(papersRes.data.total || 0);
        }

        setLoading(false);
    };

    // Sort papers client-side
    const sortedPapers = [...papers].sort((a, b) => {
        if (sortKey === "year") {
            return (b.year || 0) - (a.year || 0);
        }
        if (sortKey === "title") {
            return a.title.localeCompare(b.title);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const totalPages = Math.ceil(total / limit) || 1;

    const getStatusInfo = (status: string | undefined) => {
        switch (status) {
            case "included":
                return { label: "INCLUDED", color: "bg-green-500/20 text-green-500" };
            case "excluded":
                return { label: "EXCLUDED", color: "bg-red-500/20 text-red-500" };
            default:
                return { label: "TO READ", color: "bg-yellow-500/20 text-yellow-500" };
        }
    };

    const gradients = [
        "bg-gradient-to-br from-slate-800 to-slate-900",
        "bg-gradient-to-br from-cyan-900/40 to-blue-900/40",
        "bg-gradient-to-br from-emerald-900/40 to-teal-900/40",
        "bg-gradient-to-br from-purple-900/40 to-indigo-900/40",
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Library Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#262626]">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <span className="hover:text-white cursor-pointer">Home</span>
                        <span className="text-gray-600">›</span>
                        <span className="text-white font-medium">Library</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Research Library</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {total} paper{total !== 1 ? "s" : ""} stored across{" "}
                        {projects.length} project{projects.length !== 1 ? "s" : ""}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Search papers, authors, or citations..."
                            className="w-full bg-[#1A1D21] border border-[#333] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500"
                        />
                    </div>
                    <button className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors">
                        <ArrowUp className="w-4 h-4" /> Bulk Import
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="px-6 py-4 flex justify-end gap-3 border-b border-[#262626] bg-[#0F1115]">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1D21] border border-[#333] rounded text-xs font-bold text-gray-400 hover:text-white">
                    <Filter className="w-3 h-3" /> Filter
                </button>
                <button
                    onClick={() => {
                        const next: SortKey =
                            sortKey === "createdAt" ? "year" : sortKey === "year" ? "title" : "createdAt";
                        setSortKey(next);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1D21] border border-[#333] rounded text-xs font-bold text-gray-400 hover:text-white"
                >
                    <List className="w-3 h-3" /> Sort by{" "}
                    {sortKey === "year" ? "Year" : sortKey === "title" ? "Title" : "Date Added"}
                </button>
                <div className="flex bg-[#1A1D21] rounded border border-[#333] p-0.5">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-1.5 rounded ${viewMode === "grid" ? "bg-[#262626] text-cyan-500" : "text-gray-500 hover:text-white"}`}
                    >
                        <Grid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-1.5 rounded ${viewMode === "list" ? "bg-[#262626] text-cyan-500" : "text-gray-500 hover:text-white"}`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto bg-[#0A0A0A]">
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                    </div>
                ) : sortedPapers.length === 0 && !searchQuery ? (
                    <div className="text-center py-24">
                        <FileText className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-400 mb-2">Your library is empty.</p>
                        <p className="text-gray-600 text-sm">
                            Import papers into your projects to see them here.
                        </p>
                    </div>
                ) : sortedPapers.length === 0 ? (
                    <div className="text-center py-24">
                        <p className="text-gray-400 mb-2">
                            No papers match &quot;{searchQuery}&quot;
                        </p>
                        <p className="text-gray-600 text-sm">Try a different search term.</p>
                    </div>
                ) : (
                    <div
                        className={
                            viewMode === "grid"
                                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                                : "space-y-4"
                        }
                    >
                        {sortedPapers.map((paper, idx) => {
                            const statusInfo = getStatusInfo(paper.status);
                            const authors =
                                paper.authors && paper.authors.length > 0
                                    ? paper.authors
                                        .map((a) => `${a.lastName}, ${a.firstName?.[0] || ""}.`)
                                        .join(", ")
                                    : "Unknown";
                            const meta = `${authors} • ${paper.year || "—"} • ${paper.source || "—"}`;

                            if (viewMode === "list") {
                                return (
                                    <Link key={paper.id} href={`/dashboard/papers/${paper.id}`}>
                                        <div
                                            className="bg-[#0F1115] border border-[#262626] rounded-xl p-5 hover:border-cyan-500/30 transition-colors flex items-center gap-4 group cursor-pointer"
                                        >
                                            <span
                                                className={`text-[10px] font-bold px-2 py-1 rounded ${statusInfo.color} shrink-0`}
                                            >
                                                {statusInfo.label}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                                                    {paper.title}
                                                </h3>
                                                <p className="text-xs text-gray-500 truncate">{meta}</p>
                                            </div>
                                            <span className="text-[10px] text-gray-600 font-mono shrink-0">
                                                {formatRelativeTime(paper.createdAt)}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            }

                            return (
                                <PaperCard
                                    key={paper.id}
                                    paperId={paper.id}
                                    status={statusInfo.label}
                                    statusColor={statusInfo.color}
                                    title={paper.title}
                                    meta={meta}
                                    added={formatRelativeTime(paper.createdAt)}
                                    bg={gradients[idx % gradients.length]}
                                />
                            );
                        })}

                        {/* Add New Card — only in grid mode */}
                        {viewMode === "grid" && (
                            <div className="border-2 border-dashed border-[#333] rounded-xl flex flex-col items-center justify-center p-8 bg-[#0F1115] hover:bg-[#1A1D21] transition-colors cursor-pointer group min-h-[320px]">
                                <div className="w-12 h-12 rounded-full bg-[#1A1D21] border border-[#333] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Plus className="w-6 h-6 text-gray-500 group-hover:text-white" />
                                </div>
                                <span className="text-sm font-bold text-white mb-1">Drop PDF here</span>
                                <span className="text-xs text-gray-500">or click to browse</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {total > limit && (
                    <div className="mt-8 flex justify-between items-center text-xs text-gray-500 border-t border-[#262626] pt-4">
                        <span>
                            Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of{" "}
                            {total} results
                        </span>
                        <div className="flex gap-1">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="w-8 h-8 flex items-center justify-center rounded bg-[#1A1D21] border border-[#333] hover:text-white disabled:opacity-30"
                            >
                                ‹
                            </button>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-8 h-8 flex items-center justify-center rounded font-bold ${page === i + 1
                                        ? "bg-cyan-500 text-black"
                                        : "hover:bg-[#1A1D21] hover:text-white"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="w-8 h-8 flex items-center justify-center rounded bg-[#1A1D21] border border-[#333] hover:text-white disabled:opacity-30"
                            >
                                ›
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    return date.toLocaleDateString();
}

function PaperCard({
    paperId,
    status,
    statusColor,
    title,
    meta,
    added,
    bg,
}: {
    paperId: string;
    status: string;
    statusColor: string;
    title: string;
    meta: string;
    added: string;
    bg: string;
}) {
    return (
        <Link href={`/dashboard/papers/${paperId}`}>
            <div className="bg-[#0F1115] border border-[#262626] rounded-xl overflow-hidden hover:border-cyan-500/30 transition-colors group flex flex-col h-[320px] cursor-pointer">
                {/* Visual Header */}
                <div className={`h-40 ${bg} relative p-4`}>
                    <span
                        className={`text-[10px] font-bold px-2 py-1 rounded backdrop-blur-md ${statusColor}`}
                    >
                        {status}
                    </span>
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-tl-full"></div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-cyan-400 transition-colors">
                            {title}
                        </h3>
                        <p className="text-xs text-gray-400 mb-4 truncate">{meta}</p>
                    </div>

                    <div className="flex justify-between items-end border-t border-[#262626] pt-4">
                        <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
                            <FileText className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer" />
                            <Bookmark className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer" />
                            <MessageSquare className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer" />
                        </div>
                        <span className="text-[10px] text-gray-600 font-mono">Added {added}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
