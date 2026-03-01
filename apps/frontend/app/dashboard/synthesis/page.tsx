"use client";

import { useState, useEffect } from "react";
import { Share2, Settings, Download, ChevronDown, ChevronRight, Sliders, Activity, Loader2 } from "lucide-react";
import { paperApi, projectApi, Paper, Project } from "@/lib/api";
import { useAuth } from "@/lib/hooks/use-auth";
import { useTranslations } from "next-intl";

export default function SynthesisPage() {
    const { isAuthenticated } = useAuth();
    const t = useTranslations("synthesis");
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [papers, setPapers] = useState<Paper[]>([]);
    const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
    const [loading, setLoading] = useState(true);
    const [analysisMode, setAnalysisMode] = useState<"quantitative" | "qualitative">("quantitative");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchProjects();
    }, [isAuthenticated]);

    const fetchProjects = async () => {
        setLoading(true);
        const res = await projectApi.list();
        if (res.data) {
            setProjects(res.data.projects);
            if (res.data.projects.length > 0) {
                setSelectedProject(res.data.projects[0]);
            }
        }
        setLoading(false);
    };

    // Fetch papers for selected project
    useEffect(() => {
        if (!selectedProject) {
            setPapers([]);
            return;
        }
        fetchPapers(selectedProject.id);
    }, [selectedProject]);

    const fetchPapers = async (projectId: string) => {
        const res = await paperApi.list({ projectId, limit: 50 });
        if (res.data) {
            setPapers(res.data.papers || []);
            if (res.data.papers && res.data.papers.length > 0) {
                setSelectedPaper(res.data.papers[0]);
            } else {
                setSelectedPaper(null);
            }
        }
    };

    const getStatusInfo = (paper: Paper) => {
        switch (paper.status) {
            case "included":
                return { label: t("selected"), color: "text-cyan-500", progressColor: "bg-cyan-500", progress: 100 };
            case "excluded":
                return { label: t("excluded"), color: "text-red-500", progressColor: "bg-red-500", progress: 100 };
            default:
                return { label: t("pending"), color: "text-gray-500", progressColor: "bg-gray-700", progress: 0 };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            {/* Left Sidebar (Studies List) */}
            <div className="w-80 border-r border-[#262626] bg-[#0A0A0A] flex flex-col">
                <div className="p-4 border-b border-[#262626]">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={`Filter ${papers.length} studies...`}
                            className="w-full bg-[#1A1D21] border border-[#333] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                            <Settings className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {papers.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 text-sm">{t("noPapersInProject")}</p>
                            <p className="text-gray-600 text-xs mt-1">{t("importPapersToBegin")}</p>
                        </div>
                    ) : (
                        papers.map((paper) => {
                            const info = getStatusInfo(paper);
                            const isActive = selectedPaper?.id === paper.id;
                            const authors =
                                paper.authors?.length > 0
                                    ? `${paper.authors[0].lastName}${paper.authors.length > 1 ? " et al." : ""} (${paper.year || "—"})`
                                    : `Paper (${paper.year || "—"})`;

                            return (
                                <div
                                    key={paper.id}
                                    onClick={() => setSelectedPaper(paper)}
                                    className={`p-3 rounded-lg border ${isActive
                                            ? "bg-[#1A1D21] border-cyan-500/30"
                                            : "bg-transparent border-transparent hover:bg-[#1A1D21]"
                                        } transition-colors cursor-pointer group`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`text-[10px] font-bold ${info.color}`}>
                                            {info.label}
                                        </span>
                                        <span className="text-[10px] text-gray-600 font-mono">
                                            ID: #{paper.id.slice(-4)}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-bold text-white mb-0.5 group-hover:text-cyan-400 transition-colors truncate">
                                        {authors}
                                    </h4>
                                    <p className="text-xs text-gray-500 mb-2 truncate">{paper.title}</p>
                                    <div className="h-1 bg-[#333] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${info.progressColor}`}
                                            style={{ width: `${info.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex flex-col bg-[#0F1115]">
                {/* Workspace Header */}
                <header className="h-14 border-b border-[#262626] flex items-center justify-between px-6 bg-[#0A0A0A]">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        {/* Project selector */}
                        <select
                            value={selectedProject?.id || ""}
                            onChange={(e) => {
                                const proj = projects.find((p) => p.id === e.target.value);
                                setSelectedProject(proj || null);
                            }}
                            className="bg-transparent text-white border-none outline-none text-sm cursor-pointer"
                        >
                            {projects.map((p) => (
                                <option key={p.id} value={p.id} className="bg-[#1A1D21] text-white">
                                    {p.title}
                                </option>
                            ))}
                            {projects.length === 0 && (
                                <option value="" className="bg-[#1A1D21]">{t("noProjects")}</option>
                            )}
                        </select>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-white font-medium">{t("synthesisWorkspace")}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-[#1A1D21] rounded p-1">
                            <button
                                onClick={() => setAnalysisMode("quantitative")}
                                className={`px-3 py-1 text-xs font-bold rounded ${analysisMode === "quantitative"
                                        ? "text-white bg-[#262626] shadow-sm"
                                        : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                {t("quantitative")}
                            </button>
                            <button
                                onClick={() => setAnalysisMode("qualitative")}
                                className={`px-3 py-1 text-xs font-bold rounded ${analysisMode === "qualitative"
                                        ? "text-white bg-[#262626] shadow-sm"
                                        : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                {t("qualitative")}
                            </button>
                        </div>
                        <button className="bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold px-4 py-2 rounded flex items-center gap-2 transition-colors">
                            <Activity className="w-4 h-4" /> {t("generatePlot")}
                        </button>
                        <button className="p-2 text-gray-400 hover:text-white transition-colors">
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                {/* Statistics Bar */}
                <div className="h-12 border-b border-[#262626] bg-[#0F1115] px-6 flex items-center gap-8 text-sm">
                    <div className="flex flex-col justify-center border-r border-[#262626] pr-8 h-full">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">{t("currentStatistics")}</span>
                        <div className="flex gap-4">
                            <span className="text-gray-400 text-xs">
                                {t("totalN")}: <strong className="text-white">{papers.length}</strong>
                            </span>
                            <span className="text-gray-400 text-xs">
                                {t("selectedCount")}: <strong className="text-white">
                                    {papers.filter((p) => p.status === "included").length}
                                </strong>
                            </span>
                            <span className="text-gray-400 text-xs">
                                {t("pendingCount")}: <strong className="text-cyan-400">
                                    {papers.filter((p) => !p.status || p.status === "pending").length}
                                </strong>
                            </span>
                        </div>
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">
                            {t("modelType")}
                        </span>
                        <button className="flex items-center gap-1 text-xs font-bold text-white hover:text-cyan-400">
                            {t("randomEffects")} <ChevronDown className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                {/* Workspace Content */}
                <div className="flex-1 p-6 overflow-hidden flex flex-col">
                    {!selectedPaper ? (
                        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                            {t("selectPaper")}
                        </div>
                    ) : (
                        <div className="flex-1 bg-[#0A0A0A] border border-[#262626] rounded-xl p-6 relative">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-white truncate max-w-[70%]">
                                    {selectedPaper.title}
                                </h2>
                                <div className="flex gap-2">
                                    <button className="flex items-center gap-1 bg-[#1A1D21] border border-[#333] text-gray-400 text-xs font-bold px-2 py-1 rounded hover:text-white">
                                        <Download className="w-3 h-3" /> {t("svg")}
                                    </button>
                                    <button className="flex items-center gap-1 bg-[#1A1D21] border border-[#333] text-gray-400 text-xs font-bold px-2 py-1 rounded hover:text-white">
                                        <Sliders className="w-3 h-3" /> {t("adjust")}
                                    </button>
                                </div>
                            </div>

                            {/* Paper details */}
                            <div className="space-y-4 border-t border-[#262626] pt-4">
                                {selectedPaper.abstract ? (
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">{t("abstract")}</h3>
                                        <p className="text-sm text-gray-300 leading-relaxed">
                                            {selectedPaper.abstract}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No abstract available for this paper.</p>
                                )}
                                <div className="grid grid-cols-3 gap-4 text-xs">
                                    <div>
                                        <span className="text-gray-500">Year:</span>{" "}
                                        <span className="text-white font-medium">{selectedPaper.year || "—"}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">DOI:</span>{" "}
                                        <span className="text-white font-mono">{selectedPaper.doi || "—"}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Source:</span>{" "}
                                        <span className="text-white">{selectedPaper.source || "—"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Data Input Panel */}
                <div className="h-48 border-t border-[#262626] bg-[#0A0A0A] p-6 grid grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4">
                            STUDY DATA {selectedPaper ? `(${selectedPaper.title.slice(0, 20)}...)` : ""}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] text-gray-500 block mb-1">Mean (Int)</label>
                                <input
                                    type="text"
                                    placeholder="—"
                                    className="w-full bg-[#1A1D21] border border-[#333] rounded px-2 py-1.5 text-sm text-white"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 block mb-1">Mean (Ctrl)</label>
                                <input
                                    type="text"
                                    placeholder="—"
                                    className="w-full bg-[#1A1D21] border border-[#333] rounded px-2 py-1.5 text-sm text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4">MODERATORS</h3>
                        <div className="space-y-2">
                            <button className="w-full border border-dashed border-[#333] rounded px-3 py-2 text-xs text-gray-500 hover:text-white hover:border-gray-500 transition-colors">
                                + Add Moderator
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4">SYNTHESIS NOTES</h3>
                        <textarea
                            className="flex-1 bg-[#1A1D21] border border-[#333] rounded p-3 text-xs text-gray-300 resize-none focus:outline-none focus:border-cyan-500"
                            placeholder="Add observations for this study's contribution to the model..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        ></textarea>
                        <button className="bg-cyan-500 text-black font-bold text-xs py-2 rounded mt-3 hover:bg-cyan-400 transition-colors">
                            Save Study Synthesis
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
