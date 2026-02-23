"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    BookOpen,
    ExternalLink,
    Users,
    Calendar,
    Hash,
    Layers,
    FileText,
    Loader2,
    ChevronRight,
} from "lucide-react";
import { paperApi, Paper } from "@/lib/api";
import { useAuth } from "@/lib/hooks/use-auth";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    INCLUDED: { label: "Included", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30" },
    EXCLUDED: { label: "Excluded", color: "text-red-400", bg: "bg-red-400/10 border-red-400/30" },
    PENDING: { label: "Pending", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" },
    IN_REVIEW: { label: "In Review", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/30" },
    IN_CONFLICT: { label: "Conflict", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/30" },
};

export default function PaperDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [paper, setPaper] = useState<Paper | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.push("/login");
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (!isAuthenticated || !id) return;
        const fetch = async () => {
            setLoading(true);
            const res = await paperApi.get(id);
            if (res.data?.paper) {
                setPaper(res.data.paper);
            } else {
                setError("Paper not found.");
            }
            setLoading(false);
        };
        fetch();
    }, [isAuthenticated, id]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
        );
    }

    if (error || !paper) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-4">
                <FileText className="w-12 h-12 text-gray-700" />
                <p className="text-gray-400">{error || "Paper not found."}</p>
                <Link href="/dashboard/library" className="text-sm text-cyan-500 hover:underline">
                    ← Back to Library
                </Link>
            </div>
        );
    }

    const status = paper.screeningStatus || paper.status || "PENDING";
    const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["PENDING"];
    const authors =
        paper.authors?.length > 0
            ? paper.authors.map((a) => `${a.firstName ? a.firstName + " " : ""}${a.lastName}`).join(", ")
            : "Unknown Authors";

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white">
            {/* Top bar */}
            <div className="border-b border-[#1E1E1E] bg-[#0F1115] px-8 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <ChevronRight className="w-3 h-3 text-gray-700" />
                    <Link href="/dashboard/library" className="hover:text-white transition-colors">Library</Link>
                    <ChevronRight className="w-3 h-3 text-gray-700" />
                    <span className="text-white font-medium line-clamp-1 max-w-[360px]">{paper.title}</span>
                </div>

                {paper.project && (
                    <Link
                        href={`/dashboard/projects/${paper.project.id}`}
                        className="flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-400/10 border border-cyan-400/20 rounded-lg px-3 py-1.5 transition-colors"
                    >
                        <Layers className="w-3.5 h-3.5" />
                        View Project
                        <ExternalLink className="w-3 h-3" />
                    </Link>
                )}
            </div>

            <div className="max-w-5xl mx-auto px-8 py-10">
                {/* Hero */}
                <div className="mb-10">
                    {/* Status + source badges */}
                    <div className="flex items-center gap-3 mb-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusCfg.bg} ${statusCfg.color}`}>
                            {statusCfg.label}
                        </span>
                        {paper.source && (
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#1A1D21] border border-[#333] text-gray-400">
                                {paper.source}
                            </span>
                        )}
                        {paper.venue && (
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#1A1D21] border border-[#333] text-cyan-500">
                                {paper.venue.name}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-white leading-snug mb-4">
                        {paper.title}
                    </h1>

                    {/* Authors + year row */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        {paper.authors?.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-600" />
                                <span>{authors}</span>
                            </div>
                        )}
                        {paper.year && (
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-600" />
                                <span>{paper.year}</span>
                            </div>
                        )}
                        {paper.doi && (
                            <div className="flex items-center gap-2">
                                <Hash className="w-4 h-4 text-gray-600" />
                                <a
                                    href={`https://doi.org/${paper.doi}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-cyan-500 hover:text-cyan-400 transition-colors font-mono text-xs"
                                >
                                    {paper.doi}
                                    <ExternalLink className="inline w-3 h-3 ml-1" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main content grid */}
                <div className="grid grid-cols-3 gap-8">
                    {/* Abstract (2/3) */}
                    <div className="col-span-2 space-y-6">
                        <section className="bg-[#0F1115] border border-[#1E1E1E] rounded-2xl p-7">
                            <div className="flex items-center gap-2 mb-4">
                                <BookOpen className="w-4 h-4 text-cyan-500" />
                                <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Abstract</h2>
                            </div>
                            {paper.abstract ? (
                                <p className="text-gray-300 leading-relaxed text-[15px]">{paper.abstract}</p>
                            ) : (
                                <p className="text-gray-600 italic">No abstract available.</p>
                            )}
                        </section>
                    </div>

                    {/* Sidebar (1/3) */}
                    <div className="col-span-1 space-y-4">
                        {/* Project card */}
                        {paper.project && (
                            <Link href={`/dashboard/projects/${paper.project.id}`}>
                                <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/10 border border-cyan-500/20 rounded-2xl p-5 hover:border-cyan-500/40 transition-colors group cursor-pointer">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Project</span>
                                        <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Layers className="w-4 h-4 text-cyan-500 shrink-0" />
                                        <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors">
                                            {paper.project.title}
                                        </h3>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-[10px] font-mono text-gray-500">{paper.project.label}</span>
                                        <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${paper.project.status === "PUBLISHED"
                                                ? "bg-emerald-500/20 text-emerald-400"
                                                : paper.project.status === "ARCHIVED"
                                                    ? "bg-gray-500/20 text-gray-400"
                                                    : "bg-yellow-500/20 text-yellow-400"
                                            }`}>
                                            {paper.project.status}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        )}

                        {/* Metadata card */}
                        <div className="bg-[#0F1115] border border-[#1E1E1E] rounded-2xl p-5 space-y-4">
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Details</h3>

                            <MetaRow label="Status" value={statusCfg.label} valueClass={statusCfg.color} />
                            {paper.year && <MetaRow label="Year" value={String(paper.year)} />}
                            {paper.source && <MetaRow label="Source" value={paper.source} />}
                            {paper.venue && <MetaRow label="Venue" value={`${paper.venue.name} (${paper.venue.type})`} />}
                            {paper.bibtexKey && <MetaRow label="BibTeX Key" value={paper.bibtexKey} mono />}
                            {paper.doi && (
                                <div className="flex justify-between items-start gap-2 py-2 border-t border-[#1E1E1E]">
                                    <span className="text-xs text-gray-600 shrink-0">DOI</span>
                                    <a
                                        href={`https://doi.org/${paper.doi}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-cyan-500 hover:text-cyan-400 font-mono text-right break-all"
                                    >
                                        {paper.doi}
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Authors card */}
                        {paper.authors?.length > 0 && (
                            <div className="bg-[#0F1115] border border-[#1E1E1E] rounded-2xl p-5">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Authors</h3>
                                <div className="space-y-2">
                                    {paper.authors.map((a, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-700 to-blue-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                                                {(a.firstName?.[0] || a.lastName[0] || "?").toUpperCase()}
                                            </div>
                                            <span className="text-sm text-gray-300">
                                                {a.firstName ? `${a.firstName} ${a.lastName}` : a.lastName}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetaRow({
    label,
    value,
    valueClass = "text-gray-300",
    mono = false,
}: {
    label: string;
    value: string;
    valueClass?: string;
    mono?: boolean;
}) {
    return (
        <div className="flex justify-between items-center gap-2 py-2 border-t border-[#1E1E1E] first:border-0 first:pt-0">
            <span className="text-xs text-gray-600 shrink-0">{label}</span>
            <span className={`text-xs font-medium text-right ${valueClass} ${mono ? "font-mono" : ""}`}>{value}</span>
        </div>
    );
}
