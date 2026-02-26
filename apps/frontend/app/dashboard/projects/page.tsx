"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, Filter, Loader2, FileEdit, Trash2, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { projectApi, reportingApi, draftApi, Project, ProjectStats, ProtocolDraft } from "@/lib/api";

export default function ProjectsPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");
    const [stats, setStats] = useState<ProjectStats | null>(null);
    const [drafts, setDrafts] = useState<ProtocolDraft[]>([]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        const fetchProjects = async () => {
            // In a real app we might rely on middleware for protection
            if (!isAuthenticated) return;

            setIsLoading(true);
            const [projectsRes, statsRes, draftsRes] = await Promise.all([
                projectApi.list(),
                reportingApi.getProjectStats(),
                draftApi.list(),
            ]);

            if (projectsRes.error) {
                setError(projectsRes.error.message);
            } else if (projectsRes.data) {
                setProjects(projectsRes.data.projects);
            }
            if (statsRes.data) {
                setStats(statsRes.data);
            }
            if (draftsRes.data) {
                setDrafts(draftsRes.data.drafts);
            }
            setIsLoading(false);
        };

        fetchProjects();
    }, [isAuthenticated]);

    const filteredProjects = projects.filter((project) => {
        const matchesSearch =
            project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.label.toLowerCase().includes(searchQuery.toLowerCase());

        if (filter === "ACTIVE") {
            return matchesSearch && project.status === "PUBLISHED";
        }
        if (filter === "COMPLETED") {
            return matchesSearch && project.status === "ARCHIVED";
        }
        return matchesSearch;
    });

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "PUBLISHED":
                return { label: "ACTIVE", color: "bg-cyan-500/20 text-cyan-500" };
            case "ARCHIVED":
                return { label: "COMPLETED", color: "bg-green-500/20 text-green-500" };
            case "DRAFT":
                return { label: "DRAFT", color: "bg-yellow-500/20 text-yellow-500" };
            default:
                return { label: "UNKNOWN", color: "bg-gray-500/20 text-gray-500" };
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-white text-2xl font-bold mb-2">My Projects</h1>
                    <h2 className="text-gray-500 text-sm">Manage, monitor, and execute your systematic literature reviews.</h2>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-48 bg-[#1A1D21] border border-[#333] rounded-md py-1.5 pl-8 pr-4 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                    </div>
                    <button
                        onClick={() => setFilter("ALL")}
                        className={`px-4 py-1.5 rounded text-xs font-medium border ${filter === "ALL" ? "bg-cyan-950/30 text-cyan-500 border-cyan-900/50" : "bg-[#1A1D21] text-gray-400 border-[#333] hover:text-white"}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter("ACTIVE")}
                        className={`px-4 py-1.5 rounded text-xs font-medium border ${filter === "ACTIVE" ? "bg-cyan-950/30 text-cyan-500 border-cyan-900/50" : "bg-[#1A1D21] text-gray-400 border-[#333] hover:text-white"}`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setFilter("COMPLETED")}
                        className={`px-4 py-1.5 rounded text-xs font-medium border ${filter === "COMPLETED" ? "bg-cyan-950/30 text-cyan-500 border-cyan-900/50" : "bg-[#1A1D21] text-gray-400 border-[#333] hover:text-white"}`}
                    >
                        Completed
                    </button>
                    <button
                        onClick={() => router.push("/dashboard/projects/new")}
                        className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-3 h-3" /> New Project
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            {/* Unfinished Drafts */}
            {drafts.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FileEdit className="w-3.5 h-3.5" />
                        Unfinished Drafts
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {drafts.map((draft) => (
                            <DraftCard
                                key={draft.id}
                                draft={draft}
                                onResume={() => router.push(`/dashboard/projects/new?draft=${draft.id}`)}
                                onDelete={async () => {
                                    await draftApi.delete(draft.id);
                                    setDrafts((prev) => prev.filter((d) => d.id !== draft.id));
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Projects from API */}
                {filteredProjects.map((project) => {
                    const status = getStatusLabel(project.status);
                    return (
                        <ProjectCard
                            key={project.id}
                            title={project.title}
                            desc={project.description || "No description"}
                            progress={0}
                            screened="0 / 0"
                            members={1}
                            label={status.label}
                            labelColor={status.color}
                            projectId={project.id}
                        />
                    );
                })}

                {/* New Project Card Placeholder if empty or just as CTA */}
                <div
                    onClick={() => router.push("/dashboard/projects/new")}
                    className="border-2 border-dashed border-[#262626] rounded-xl flex flex-col items-center justify-center p-12 min-h-[320px] bg-[#0A0A0A] hover:bg-[#111] transition-colors cursor-pointer group"
                >
                    <div className="w-16 h-16 rounded-full bg-[#1A1D21] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Plus className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">New Review</h3>
                    <p className="text-gray-500 text-center max-w-xs text-sm">
                        Start a fresh protocol, import papers, and invite your team.
                    </p>
                </div>
            </div>

            <div className="mt-16 border-t border-[#262626] pt-8 flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <div className="flex gap-8">
                    <span>TOTAL REVIEWS: {projects.length}</span>
                    <span>PAPERS ANALYZED: {stats?.papers?.total?.toLocaleString() ?? "0"}</span>
                    <span>SCREENING COMPLETED: {stats?.screening?.completed?.toLocaleString() ?? "0"}</span>
                </div>
                <div className="flex gap-4 normal-case font-normal text-xs text-gray-500 cursor-pointer">
                    <span className="hover:text-cyan-500">Documentation</span>
                    <span>•</span>
                    <span className="hover:text-cyan-500">Protocol Wizard</span>
                    <span>•</span>
                    <span className="hover:text-cyan-500">API Access</span>
                </div>
            </div>
        </div>
    );
}

function ProjectCard({ title, desc, progress, screened, members, label, labelColor, projectId }: any) {
    return (
        <Link href={`/dashboard/projects/${projectId}`}>
            <div className="rounded-xl overflow-hidden bg-[#1A1D21] border border-[#262626] relative group h-[340px] flex flex-col justify-end cursor-pointer hover:border-cyan-500/50 transition-colors">
                {/* Abstract Background Visual */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="absolute top-4 right-4 z-10">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${labelColor} border border-current/20`}>{label}</span>
                </div>

                <div className="relative p-6 z-10 flex flex-col h-full justify-between">
                    <div className="pt-2">
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{title}</h3>
                        <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{desc}</p>
                    </div>

                    <div>
                        <div className="mb-6">
                            <div className="flex justify-between text-[10px] font-bold uppercase mb-2 text-gray-500">
                                <span>{progress === 100 ? "ARCHIVED" : "PROGRESS"}</span>
                                <span className="text-cyan-500">{progress}%</span>
                            </div>
                            <div className="h-1 bg-[#333] rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>

                        <div className="flex justify-between items-end border-t border-[#262626] pt-4">
                            <div>
                                <div className="text-[10px] font-bold uppercase text-gray-600 mb-1">SCREENED</div>
                                <div className="text-sm font-bold text-white flex items-center gap-1">
                                    <span>{screened}</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase text-gray-600 mb-1 text-right">TEAM</div>
                                <div className="flex -space-x-2 justify-end">
                                    {[...Array(Math.min(members, 3))].map((_, i) => (
                                        <div key={i} className="w-6 h-6 rounded-full bg-[#262626] border border-[#1A1D21] flex items-center justify-center text-[8px] text-gray-400">?</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

const STEP_LABELS = ["General", "Screening", "QA", "Extraction", "Reporting", "Review"];

function DraftCard({
    draft,
    onResume,
    onDelete,
}: {
    draft: ProtocolDraft;
    onResume: () => void;
    onDelete: () => void;
}) {
    const formData = draft.formData as Record<string, unknown>;
    const protocol = formData?.protocol as Record<string, unknown> | undefined;
    const projectInfo = protocol?.project as Record<string, unknown> | undefined;
    const title = (projectInfo?.name as string) || draft.name || "Untitled Draft";
    const shortName = (projectInfo?.short_name as string) || "";
    const completedSteps = draft.currentStep;
    const progressPct = Math.round((completedSteps / 6) * 100);

    return (
        <div className="rounded-xl overflow-hidden bg-[#1A1D21] border border-orange-500/30 relative group h-50 flex flex-col cursor-pointer hover:border-orange-400/60 transition-colors">
            {/* Gradient accent */}
            <div className="absolute inset-0 bg-linear-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Tag */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    UNFINISHED DRAFT
                </span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="p-1 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete draft"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Content */}
            <div className="relative p-5 z-10 flex flex-col h-full justify-between" onClick={onResume}>
                <div>
                    <h3 className="text-base font-bold text-white mb-1 line-clamp-1 pr-32">{title}</h3>
                    {shortName && (
                        <p className="text-[11px] text-gray-500 font-mono">{shortName}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                        Step {completedSteps + 1} of 6 — {STEP_LABELS[completedSteps] || "Review"}
                    </p>
                </div>

                <div>
                    {/* Progress */}
                    <div className="mb-3">
                        <div className="flex justify-between text-[10px] font-bold uppercase mb-1.5 text-gray-500">
                            <span>PROGRESS</span>
                            <span className="text-orange-400">{progressPct}%</span>
                        </div>
                        <div className="h-1 bg-[#333] rounded-full overflow-hidden">
                            <div className="h-full bg-orange-400 transition-all" style={{ width: `${progressPct}%` }} />
                        </div>
                    </div>

                    {/* Resume button */}
                    <button
                        onClick={onResume}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-colors"
                    >
                        Resume <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
