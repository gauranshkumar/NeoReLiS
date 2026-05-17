"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    Search,
    FileText,
    Upload,
    Loader2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { paperApi, Paper } from "@/lib/api";

interface PapersListProps {
    projectId: string;
    onImportClick: () => void;
}

export function PapersList({ projectId, onImportClick }: PapersListProps) {
    const t = useTranslations("papers.import");
    const [papers, setPapers] = useState<Paper[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const limit = 20;

    const fetchPapers = useCallback(async () => {
        setIsLoading(true);
        const res = await paperApi.list({
            projectId,
            page,
            limit,
            search: search || undefined,
        });
        if (res.data) {
            setPapers(res.data.papers);
            setTotal(res.data.total);
        }
        setIsLoading(false);
    }, [projectId, page, limit, search]);

    useEffect(() => {
        fetchPapers();
    }, [fetchPapers]);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const totalPages = Math.ceil(total / limit) || 1;

    const getStatusInfo = (status: string | undefined) => {
        switch (status?.toUpperCase()) {
            case "INCLUDED":
                return { label: "INCLUDED", color: "bg-green-500/20 text-green-400" };
            case "EXCLUDED":
                return { label: "EXCLUDED", color: "bg-red-500/20 text-red-400" };
            case "CONFLICT":
                return { label: "CONFLICT", color: "bg-orange-500/20 text-orange-400" };
            default:
                return { label: "PENDING", color: "bg-yellow-500/20 text-yellow-400" };
        }
    };

    const formatAuthors = (authors: { firstName: string | null; lastName: string }[]) => {
        if (!authors || authors.length === 0) return t("unknownAuthors");
        return authors
            .slice(0, 3)
            .map((a) => `${a.lastName}${a.firstName ? `, ${a.firstName.charAt(0)}.` : ""}`)
            .join("; ") + (authors.length > 3 ? " et al." : "");
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString();
    };

    // Empty state
    if (!isLoading && papers.length === 0 && !search) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-6">
                <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-[#262626] flex items-center justify-center mb-6">
                    <FileText className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                    {t("noPapersInProject")}
                </h3>
                <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
                    {t("importToGetStarted")}
                </p>
                <button
                    onClick={onImportClick}
                    className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
                >
                    <Upload className="h-5 w-5" />
                    {t("importPapersButton")}
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Search bar */}
            <div className="px-6 py-4 border-b border-[#262626]">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder={t("searchPapers")}
                            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500"
                        />
                    </div>
                    <button
                        onClick={onImportClick}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm rounded-lg font-medium transition-colors"
                    >
                        <Upload className="h-4 w-4" />
                        {t("importMore")}
                    </button>
                </div>
            </div>

            {/* Papers list */}
            <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                    </div>
                ) : papers.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400 mb-2">
                            {t("noSearchResults", { query: search })}
                        </p>
                        <p className="text-gray-600 text-sm">{t("tryDifferentSearch")}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {papers.map((paper) => {
                            const statusInfo = getStatusInfo(paper.status);
                            return (
                                <Link
                                    key={paper.id}
                                    href={`/dashboard/papers/${paper.id}`}
                                    className="block"
                                >
                                    <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4 hover:border-cyan-500/30 transition-colors group">
                                        <div className="flex items-start gap-4">
                                            <span
                                                className={`text-[10px] font-bold px-2 py-1 rounded shrink-0 ${statusInfo.color}`}
                                            >
                                                {statusInfo.label}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                                                    {paper.title}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-1 truncate">
                                                    {formatAuthors(paper.authors)}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                                                    {paper.year && (
                                                        <span>{paper.year}</span>
                                                    )}
                                                    {paper.doi && (
                                                        <span className="truncate max-w-[200px]">
                                                            DOI: {paper.doi}
                                                        </span>
                                                    )}
                                                    <span className="ml-auto">
                                                        {formatDate(paper.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {total > limit && (
                <div className="px-6 py-4 border-t border-[#262626] flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                        {t("showingResults", {
                            from: (page - 1) * limit + 1,
                            to: Math.min(page * limit, total),
                            total,
                        })}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="p-2 rounded bg-[#1a1a1a] border border-[#333] text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-sm text-gray-400 px-2">
                            {page} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="p-2 rounded bg-[#1a1a1a] border border-[#333] text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
