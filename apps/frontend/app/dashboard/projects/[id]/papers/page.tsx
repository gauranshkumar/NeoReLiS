"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Upload,
    FileText,
    Table,
    BookOpen,
    Download,
    Loader2,
    CheckCircle,
    AlertCircle,
    List,
    Search,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/hooks/use-auth";
import { projectApi, Project, paperApi, ImportJob, Paper } from "@/lib/api";
import { BibtexImport } from "./components/bibtex-import";
import { CSVImport } from "./components/csv-import";
import { EndnoteImport } from "./components/endnote-import";
import { ImportResults } from "./components/import-results";
import { ImportJobDetail } from "./components/import-job-detail";
import { PapersList } from "./components/papers-list";

type PageView = "papers" | "import";
type ImportFormat = "bibtex" | "csv" | "endnote";

interface ImportResultData {
    imported: number;
    duplicates: number;
    errors: { row?: number; entry?: string; message: string }[];
    importJobId: string;
}

export default function ProjectPapersPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: projectId } = use(params);
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const t = useTranslations("papers.import");
    const tCommon = useTranslations("common");

    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pageView, setPageView] = useState<PageView>("papers");
    const [activeImportTab, setActiveImportTab] = useState<ImportFormat>("bibtex");
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<ImportResultData | null>(null);
    const [recentJobs, setRecentJobs] = useState<ImportJob[]>([]);
    const [error, setError] = useState("");
    const [paperCount, setPaperCount] = useState(0);
    const [selectedJob, setSelectedJob] = useState<ImportJob | null>(null);
    const [isLoadingJob, setIsLoadingJob] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated && projectId) {
            fetchProject();
            fetchRecentJobs();
            fetchPaperCount();
        }
    }, [isAuthenticated, projectId]);

    const fetchProject = async () => {
        setIsLoading(true);
        const res = await projectApi.get(projectId);
        if (res.data?.project) {
            setProject(res.data.project);
        } else {
            setError(res.error?.message || "Failed to load project");
        }
        setIsLoading(false);
    };

    const fetchRecentJobs = async () => {
        const res = await paperApi.listImportJobs(projectId);
        if (res.data?.jobs) {
            setRecentJobs(res.data.jobs.slice(0, 5));
        }
    };

    const fetchPaperCount = async () => {
        const res = await paperApi.list({ projectId, limit: 1 });
        if (res.data) {
            setPaperCount(res.data.total);
        }
    };

    const handleImportComplete = (result: ImportResultData) => {
        setImportResult(result);
        setIsImporting(false);
        fetchRecentJobs();
        fetchPaperCount();
    };

    const handleImportStart = () => {
        setIsImporting(true);
        setImportResult(null);
        setError("");
    };

    const handleImportError = (errorMsg: string) => {
        setError(errorMsg);
        setIsImporting(false);
    };

    const clearResults = () => {
        setImportResult(null);
        setError("");
    };

    const switchToImport = () => {
        setPageView("import");
        clearResults();
    };

    const handleJobClick = async (job: ImportJob) => {
        setIsLoadingJob(true);
        const res = await paperApi.getImportJob(job.id);
        if (res.data?.job) {
            setSelectedJob(res.data.job);
        } else {
            setSelectedJob(job);
        }
        setIsLoadingJob(false);
    };

    if (authLoading || isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <p className="text-gray-400">{error || "Project not found"}</p>
                <Link
                    href="/dashboard/projects"
                    className="text-cyan-500 hover:text-cyan-400"
                >
                    {tCommon("backToProjects")}
                </Link>
            </div>
        );
    }

    const importTabs = [
        { id: "bibtex" as const, label: t("bibtex"), icon: FileText },
        { id: "csv" as const, label: t("csv"), icon: Table },
        { id: "endnote" as const, label: t("endnote"), icon: BookOpen },
    ];

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#262626]">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Link
                            href="/dashboard/projects"
                            className="hover:text-white"
                        >
                            {tCommon("projects")}
                        </Link>
                        <span className="text-gray-600">›</span>
                        <Link
                            href={`/dashboard/projects/${projectId}`}
                            className="hover:text-white"
                        >
                            {project.title}
                        </Link>
                        <span className="text-gray-600">›</span>
                        <span className="text-white font-medium">
                            {t("papersTitle")}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FileText className="h-6 w-6 text-cyan-500" />
                        {t("papersTitle")}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {t("paperCount", { count: paperCount })}
                    </p>
                </div>
                <Link
                    href={`/dashboard/projects/${projectId}`}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {tCommon("back")}
                </Link>
            </div>

            {/* View Toggle */}
            <div className="px-6 pt-4 pb-2 border-b border-[#262626] bg-[#0a0a0a]">
                <div className="flex gap-1 p-1 bg-[#1a1a1a] rounded-lg w-fit">
                    <button
                        onClick={() => setPageView("papers")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            pageView === "papers"
                                ? "bg-cyan-500/20 text-cyan-400"
                                : "text-gray-400 hover:text-white hover:bg-[#262626]"
                        }`}
                    >
                        <List className="h-4 w-4" />
                        {t("papersTab")}
                        {paperCount > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 bg-[#262626] rounded text-xs">
                                {paperCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setPageView("import")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            pageView === "import"
                                ? "bg-cyan-500/20 text-cyan-400"
                                : "text-gray-400 hover:text-white hover:bg-[#262626]"
                        }`}
                    >
                        <Upload className="h-4 w-4" />
                        {t("importTab")}
                    </button>
                </div>
            </div>

            {/* Papers List View */}
            {pageView === "papers" && (
                <div className="flex-1 overflow-hidden">
                    <PapersList
                        projectId={projectId}
                        onImportClick={switchToImport}
                    />
                </div>
            )}

            {/* Import Job Detail Modal */}
            {selectedJob && (
                <ImportJobDetail
                    job={selectedJob}
                    onClose={() => setSelectedJob(null)}
                />
            )}

            {/* Import View */}
            {pageView === "import" && (
                <div className="flex flex-1 overflow-hidden">
                    {/* Main content */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {/* Import Tab navigation */}
                        <div className="flex gap-1 p-1 bg-[#1a1a1a] rounded-lg mb-6 w-fit">
                            {importTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveImportTab(tab.id);
                                        clearResults();
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                        activeImportTab === tab.id
                                            ? "bg-cyan-500/20 text-cyan-400"
                                            : "text-gray-400 hover:text-white hover:bg-[#262626]"
                                    }`}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Error display */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                                <p className="text-red-400 text-sm">{error}</p>
                                <button
                                    onClick={() => setError("")}
                                    className="ml-auto text-red-400 hover:text-red-300"
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        {/* Import result display */}
                        {importResult && (
                            <ImportResults
                                result={importResult}
                                onClose={() => {
                                    clearResults();
                                    setPageView("papers");
                                }}
                                projectId={projectId}
                            />
                        )}

                        {/* Import forms */}
                        {!importResult && (
                            <div className="bg-[#1a1a1a] rounded-xl border border-[#262626] p-6">
                                {activeImportTab === "bibtex" && (
                                    <BibtexImport
                                        projectId={projectId}
                                        onImportStart={handleImportStart}
                                        onImportComplete={handleImportComplete}
                                        onError={handleImportError}
                                        isImporting={isImporting}
                                    />
                                )}
                                {activeImportTab === "csv" && (
                                    <CSVImport
                                        projectId={projectId}
                                        onImportStart={handleImportStart}
                                        onImportComplete={handleImportComplete}
                                        onError={handleImportError}
                                        isImporting={isImporting}
                                    />
                                )}
                                {activeImportTab === "endnote" && (
                                    <EndnoteImport
                                        projectId={projectId}
                                        onImportStart={handleImportStart}
                                        onImportComplete={handleImportComplete}
                                        onError={handleImportError}
                                        isImporting={isImporting}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Recent imports */}
                    <div className="w-80 border-l border-[#262626] p-6 overflow-y-auto bg-[#0a0a0a]">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                            {t("recentImports")}
                        </h3>
                        {recentJobs.length === 0 ? (
                            <p className="text-sm text-gray-500">
                                {t("noRecentImports")}
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {recentJobs.map((job) => (
                                    <button
                                        key={job.id}
                                        onClick={() => handleJobClick(job)}
                                        className="w-full text-left p-3 bg-[#1a1a1a] rounded-lg border border-[#262626] hover:border-cyan-500/40 cursor-pointer transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-gray-500 uppercase">
                                                {job.fileType}
                                            </span>
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded ${
                                                    job.status === "COMPLETED"
                                                        ? "bg-green-500/20 text-green-400"
                                                        : job.status === "VALIDATED"
                                                        ? "bg-red-500/20 text-red-400"
                                                        : "bg-yellow-500/20 text-yellow-400"
                                                }`}
                                            >
                                                {job.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-white truncate">
                                            {job.filename}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3 text-green-500" />
                                                {job.successRows}
                                            </span>
                                            {job.duplicateRows > 0 && (
                                                <span className="text-yellow-500">
                                                    {job.duplicateRows} duplicates
                                                </span>
                                            )}
                                            {job.errorRows > 0 && (
                                                <span className="text-red-500">
                                                    {job.errorRows} errors
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {new Date(job.createdAt).toLocaleDateString()}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Download template link */}
                        <div className="mt-6 pt-6 border-t border-[#262626]">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                {t("templates")}
                            </h3>
                            <button
                                onClick={async () => {
                                    const res = await paperApi.getCSVTemplate();
                                    if (res.data?.template) {
                                        const blob = new Blob([res.data.template], {
                                            type: "text/csv",
                                        });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement("a");
                                        a.href = url;
                                        a.download = "paper_import_template.csv";
                                        a.click();
                                        URL.revokeObjectURL(url);
                                    }
                                }}
                                className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"
                            >
                                <Download className="h-4 w-4" />
                                {t("downloadCSVTemplate")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
