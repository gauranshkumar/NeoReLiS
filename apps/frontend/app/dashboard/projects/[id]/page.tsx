"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    FileText,
    Users,
    Settings,
    BarChart3,
    ClipboardCheck,
    Import,
    Loader2,
    Calendar,
    Tag,
    Shield,
    ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { projectApi, Project, ProjectMember, ProjectSettings } from "@/lib/api";

interface ProjectDetailData extends Project {
    paperCount?: number;
    memberCount?: number;
    members?: ProjectMember[];
}

export default function ProjectDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [project, setProject] = useState<ProjectDetailData | null>(null);
    const [settings, setSettings] = useState<ProjectSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (!isAuthenticated || !id) return;

        const fetchProject = async () => {
            setIsLoading(true);
            const [projectRes, settingsRes] = await Promise.all([
                projectApi.get(id),
                projectApi.getSettings(id),
            ]);

            if (projectRes.error) {
                setError(projectRes.error.message);
            } else if (projectRes.data) {
                setProject(projectRes.data.project as ProjectDetailData);
            }

            if (settingsRes.data) {
                setSettings(settingsRes.data.settings);
            }

            setIsLoading(false);
        };

        fetchProject();
    }, [isAuthenticated, id]);

    if (authLoading || isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="max-w-350 mx-auto">
                <Link
                    href="/dashboard/projects"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Projects
                </Link>
                <div className="p-12 bg-[#1A1D21] border border-[#262626] rounded-xl text-center">
                    <h2 className="text-xl font-bold text-white mb-2">Project Not Found</h2>
                    <p className="text-gray-400 text-sm">
                        {error || "The project you're looking for doesn't exist or you don't have access."}
                    </p>
                </div>
            </div>
        );
    }

    const statusConfig: Record<string, { label: string; color: string }> = {
        PUBLISHED: { label: "ACTIVE", color: "bg-cyan-500/20 text-cyan-500 border-cyan-500/30" },
        ARCHIVED: { label: "COMPLETED", color: "bg-green-500/20 text-green-500 border-green-500/30" },
        DRAFT: { label: "DRAFT", color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" },
    };

    const status = statusConfig[project.status] || {
        label: project.status,
        color: "bg-gray-500/20 text-gray-500 border-gray-500/30",
    };

    const workflowSteps = [
        {
            title: "Import Papers",
            description: "Upload CSV, BibTeX, or search databases",
            icon: Import,
            href: `/dashboard/projects/${id}/papers`,
            enabled: settings?.importPapersOn ?? true,
            stat: project.paperCount ?? 0,
            statLabel: "papers",
        },
        {
            title: "Screening",
            description: "Review and filter papers by criteria",
            icon: ClipboardCheck,
            href: `/dashboard/projects/${id}/screening`,
            enabled: settings?.screeningOn ?? false,
            stat: null,
            statLabel: "",
        },
        {
            title: "Data Extraction",
            description: "Extract and classify data from papers",
            icon: FileText,
            href: `/dashboard/projects/${id}/extraction`,
            enabled: settings?.classificationOn ?? false,
            stat: null,
            statLabel: "",
        },
        {
            title: "Reporting",
            description: "Analyze results and generate charts",
            icon: BarChart3,
            href: `/dashboard/projects/${id}/reporting`,
            enabled: true,
            stat: null,
            statLabel: "",
        },
    ];

    return (
        <div className="max-w-350 mx-auto">
            {/* Breadcrumb */}
            <Link
                href="/dashboard/projects"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Projects
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl font-bold text-white truncate">
                            {project.title}
                        </h1>
                        <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded border ${status.color}`}
                        >
                            {status.label}
                        </span>
                    </div>
                    {project.description && (
                        <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
                            {project.description}
                        </p>
                    )}
                    <div className="flex items-center gap-6 mt-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5" />
                            {project.label}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            Created{" "}
                            {new Date(project.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </span>
                        {project.creator && (
                            <span className="flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5" />
                                {project.creator.name}
                            </span>
                        )}
                        {project.role && (
                            <span className="flex items-center gap-1.5 text-cyan-500">
                                Your role: {project.role}
                            </span>
                        )}
                    </div>
                </div>
                <Link
                    href={`/dashboard/projects/${id}/settings`}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#333] bg-[#1A1D21] text-gray-300 hover:text-white hover:border-cyan-500/50 transition-colors text-sm"
                >
                    <Settings className="w-4 h-4" /> Settings
                </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <StatCard
                    label="Papers"
                    value={project.paperCount ?? 0}
                    icon={<FileText className="w-4 h-4 text-cyan-500" />}
                />
                <Link href={`/dashboard/projects/${id}/team`}>
                    <StatCard
                        label="Team Members"
                        value={project.memberCount ?? 0}
                        icon={<Users className="w-4 h-4 text-cyan-500" />}
                    />
                </Link>
                <StatCard
                    label="Screening"
                    value={settings?.screeningOn ? "Enabled" : "Disabled"}
                    icon={<ClipboardCheck className="w-4 h-4 text-cyan-500" />}
                />
                <StatCard
                    label="Reviewers / Paper"
                    value={settings?.screeningReviewerNum ?? "—"}
                    icon={<Users className="w-4 h-4 text-cyan-500" />}
                />
            </div>

            {/* Workflow Steps */}
            <div className="mb-8">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Review Workflow
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {workflowSteps.map((step, idx) => (
                        <div
                            key={step.title}
                            onClick={() => router.push(step.href)}
                            className={`group relative rounded-xl border p-5 transition-all cursor-pointer ${
                                step.enabled
                                    ? "bg-[#1A1D21] border-[#262626] hover:border-cyan-500/50"
                                    : "bg-[#0E0E10] border-[#1A1D21] opacity-50 cursor-not-allowed"
                            }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-600">{idx + 1}</span>
                                    <step.icon className="w-5 h-5 text-cyan-500" />
                                </div>
                                {step.enabled && (
                                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-500 transition-colors" />
                                )}
                            </div>
                            <h3 className="text-white font-semibold text-sm mb-1">
                                {step.title}
                            </h3>
                            <p className="text-gray-500 text-xs leading-relaxed">
                                {step.description}
                            </p>
                            {step.stat !== null && (
                                <div className="mt-3 pt-3 border-t border-[#262626]">
                                    <span className="text-cyan-500 font-bold text-lg">{step.stat}</span>
                                    <span className="text-gray-500 text-xs ml-1">{step.statLabel}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Team Members */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        Team
                    </h2>
                    <Link
                        href={`/dashboard/projects/${id}/team`}
                        className="text-xs text-cyan-500 hover:text-cyan-400 transition-colors"
                    >
                        Manage Team →
                    </Link>
                </div>
                {project.members && project.members.length > 0 ? (
                    <div className="bg-[#1A1D21] border border-[#262626] rounded-xl overflow-hidden">
                        <div className="divide-y divide-[#262626]">
                            {project.members.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between px-5 py-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-black text-xs font-bold">
                                            {member.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">
                                                {member.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                @{member.username}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-gray-400 bg-[#0A0A0A] px-3 py-1 rounded-full border border-[#262626]">
                                        {member.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <Link
                        href={`/dashboard/projects/${id}/team`}
                        className="block bg-[#1A1D21] border border-dashed border-[#333] rounded-xl p-8 text-center hover:border-cyan-500/50 transition-colors"
                    >
                        <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm font-medium">
                            Add team members to collaborate
                        </p>
                        <p className="text-cyan-500 text-xs mt-1">
                            Click to manage team →
                        </p>
                    </Link>
                )}
            </div>

            {/* Configuration Summary */}
            {settings && (
                <div>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        Configuration
                    </h2>
                    <div className="bg-[#1A1D21] border border-[#262626] rounded-xl p-5">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <ConfigItem label="Screening" value={settings.screeningOn ? "On" : "Off"} />
                            <ConfigItem label="Conflict Type" value={settings.screeningConflictType} />
                            <ConfigItem label="Conflict Resolution" value={settings.screeningConflictRes} />
                            <ConfigItem label="Validation %" value={`${settings.validationDefaultPercent}%`} />
                            <ConfigItem label="Classification" value={settings.classificationOn ? "On" : "Off"} />
                            <ConfigItem label="Screening Validation" value={settings.screeningValidationOn ? "On" : "Off"} />
                            <ConfigItem label="Import Papers" value={settings.importPapersOn ? "On" : "Off"} />
                            <ConfigItem label="Source Papers" value={settings.sourcePapersOn ? "On" : "Off"} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
}) {
    return (
        <div className="bg-[#1A1D21] border border-[#262626] rounded-xl px-5 py-4">
            <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-gray-500 uppercase tracking-wider font-medium">{label}</span></div>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
    );
}

function ConfigItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                {label}
            </p>
            <p className="text-sm text-white">{value || "—"}</p>
        </div>
    );
}
