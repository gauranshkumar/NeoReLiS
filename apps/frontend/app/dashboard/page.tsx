"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  projectApi,
  reportingApi,
  paperApi,
  Project,
  ProjectStats,
  Paper,
} from "@/lib/api";
import {
  FileText,
  Database,
  Users,
  TrendingUp,
  MoreHorizontal,
  Bookmark,
  Sparkles,
  Loader2,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Real data states
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [recentPapers, setRecentPapers] = useState<Paper[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch data from backend
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchDashboardData = async () => {
      setDataLoading(true);

      // Fetch projects, stats, and recent papers in parallel
      const [projectsRes, statsRes, papersRes] = await Promise.all([
        projectApi.list(),
        reportingApi.getProjectStats(),
        paperApi.list({ limit: 5 }),
      ]);

      if (projectsRes.data) {
        setProjects(projectsRes.data.projects);
      }
      if (statsRes.data) {
        setStats(statsRes.data);
      }
      if (papersRes.data) {
        setRecentPapers(papersRes.data.papers || []);
      }

      setDataLoading(false);
    };

    fetchDashboardData();
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Derive metric values from real stats
  const papersScreened = stats?.papers?.total ?? 0;
  const dataExtracted = stats?.dataExtraction?.completed ?? 0;
  const totalCollaborators = projects.length; // Number of projects as a proxy for collaboration
  const completionRate =
    stats?.screening?.completed && stats?.screening?.totalAssigned
      ? Math.round(
        (stats.screening.completed / stats.screening.totalAssigned) * 100
      )
      : 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
      {/* Main Content Column */}
      <div className="xl:col-span-3 space-y-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={<FileText className="w-5 h-5 text-cyan-500" />}
            value={papersScreened.toLocaleString()}
            label="TOTAL PAPERS"
            badge={
              papersScreened > 0
                ? { text: "ACTIVE", color: "bg-green-500/10 text-green-500" }
                : { text: "—", color: "bg-[#222] text-gray-400 border border-[#333]" }
            }
          />
          <MetricCard
            icon={<Database className="w-5 h-5 text-cyan-500" />}
            value={dataExtracted.toLocaleString()}
            label="DATA EXTRACTED"
            badge={
              dataExtracted > 0
                ? { text: "ACTIVE", color: "bg-green-500/10 text-green-500" }
                : { text: "STABLE", color: "bg-[#222] text-gray-400 border border-[#333]" }
            }
          />
          <MetricCard
            icon={<Users className="w-5 h-5 text-cyan-500" />}
            value={String(totalCollaborators)}
            label="PROJECTS"
            badge={{ text: "ACTIVE", color: "bg-cyan-500/10 text-cyan-500" }}
          />
          <MetricCard
            icon={<TrendingUp className="w-5 h-5 text-cyan-500" />}
            value={completionRate > 0 ? `${completionRate}%` : "—"}
            label="COMPLETION RATE"
            badge={
              completionRate >= 80
                ? { text: "HIGH", color: "bg-green-500/10 text-green-500" }
                : completionRate >= 50
                  ? { text: "MODERATE", color: "bg-yellow-500/10 text-yellow-500" }
                  : { text: "—", color: "bg-[#222] text-gray-400 border border-[#333]" }
            }
          />
        </div>

        {/* Active Reviews — live from backend */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">Active Reviews</h2>
              <span className="bg-[#1A1D21] text-cyan-500 text-xs font-bold px-2 py-0.5 rounded border border-cyan-900/30">
                {projects.length} TOTAL
              </span>
            </div>
            <Link
              href="/projects"
              className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
            >
              View all <span className="text-xs">›</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {dataLoading ? (
              <div className="col-span-2 flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
              </div>
            ) : projects.length === 0 ? (
              <div className="col-span-2 bg-[#0F1115] border border-[#262626] rounded-xl p-12 text-center">
                <p className="text-gray-400 mb-4">
                  No projects yet. Start your first review!
                </p>
                <Link
                  href="/dashboard/projects"
                  className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-2.5 rounded-lg transition-colors text-sm"
                >
                  Create Project
                </Link>
              </div>
            ) : (
              projects.slice(0, 4).map((project) => (
                <ReviewCard
                  key={project.id}
                  title={project.title}
                  desc={project.description || "No description"}
                  time={formatRelativeTime(project.createdAt)}
                  status={project.status}
                  projectId={project.id}
                  creator={project.creator}
                />
              ))
            )}
          </div>
        </div>

        {/* Recent Papers — fetched from backend */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent Papers</h2>
            <Link
              href="/dashboard/library"
              className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
            >
              View library <span className="text-xs">›</span>
            </Link>
          </div>
          <div className="space-y-4">
            {dataLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-500" />
              </div>
            ) : recentPapers.length === 0 ? (
              <div className="bg-[#0F1115] border border-[#262626] rounded-xl p-8 text-center">
                <p className="text-gray-400 text-sm">
                  No papers imported yet. Import papers into your projects to see them here.
                </p>
              </div>
            ) : (
              recentPapers.map((paper) => {
                const authors =
                  paper.authors && paper.authors.length > 0
                    ? paper.authors
                      .map((a) => `${a.firstName} ${a.lastName}`)
                      .join(", ")
                    : "Unknown";
                return (
                  <PaperRow
                    key={paper.id}
                    href={`/dashboard/papers/${paper.id}`}
                    title={paper.title}
                    authors={authors}
                    year={paper.year ? String(paper.year) : "—"}
                    source={paper.source || "—"}
                    doi={paper.doi || undefined}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar Column */}
      <div className="space-y-8">
        {/* Recent Activity */}
        <div className="bg-[#0F1115] border border-[#262626] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              RECENT ACTIVITY
            </h3>
            <MoreHorizontal className="w-4 h-4 text-gray-500 cursor-pointer hover:text-white" />
          </div>
          <div className="space-y-6">
            {projects.length === 0 ? (
              <p className="text-sm text-gray-500">No activity yet.</p>
            ) : (
              projects.slice(0, 3).map((project) => (
                <ActivityItem
                  key={project.id}
                  initials={
                    project.creator
                      ? project.creator.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                      : user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "U"
                  }
                  bg="bg-blue-500"
                  name={project.creator?.name || user?.name || "You"}
                  action={`created project "${project.title}"`}
                  time={formatRelativeTime(project.createdAt)}
                />
              ))
            )}
          </div>
          <button className="w-full mt-6 bg-[#1A1D21] border border-[#333] text-gray-400 text-xs font-bold py-2 rounded hover:bg-[#222] hover:text-white transition-colors">
            VIEW AUDIT LOG
          </button>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-b from-[#0F1520] to-[#0F1115] border border-cyan-900/30 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 blur-2xl rounded-full pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-cyan-400">AI Insights</h3>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed italic">
            {projects.length > 0
              ? `You have ${projects.length} active project${projects.length > 1 ? "s" : ""} with ${papersScreened} total papers. ${completionRate > 0
                ? `Your completion rate is ${completionRate}%.`
                : "Start screening to track progress."
              }`
              : "Create your first project to get started with AI-powered insights."}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Helper Functions ────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// ─── Sub-Components ─────────────────────────────────────────────────

function MetricCard({
  icon,
  value,
  label,
  badge,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  badge: { text: string; color: string };
}) {
  return (
    <div className="bg-[#0F1115] border border-[#262626] rounded-xl p-5 hover:border-[#444] transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-[#1A1D21] rounded-lg group-hover:bg-cyan-900/20 transition-colors">
          {icon}
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badge.color}`}>
          {badge.text}
        </span>
      </div>
      <div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          {label}
        </div>
      </div>
    </div>
  );
}

function ReviewCard({
  title,
  desc,
  time,
  status,
  projectId,
  creator,
}: {
  title: string;
  desc: string;
  time: string;
  status: string;
  projectId: string;
  creator?: { id: string; username: string; name: string };
}) {
  const progress =
    status === "ARCHIVED" ? 100 : status === "PUBLISHED" ? 50 : 10;
  const phase =
    status === "ARCHIVED"
      ? "COMPLETED"
      : status === "PUBLISHED"
        ? "ACTIVE"
        : "DRAFT";

  return (
    <Link href={`/dashboard/projects/${projectId}`}>
      <div className="bg-[#0F1115] border border-[#262626] rounded-xl p-6 hover:border-cyan-500/50 transition-colors group flex flex-col justify-between h-full cursor-pointer">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-cyan-400 transition-colors">
              {title}
            </h3>
            <div className="p-1.5 bg-[#1A1D21] rounded text-cyan-500">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-4 line-clamp-2 min-h-[40px]">
            {desc}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
            <span className="flex items-center gap-1">⏰ {time}</span>
            {creator && (
              <span className="flex items-center gap-1">
                👤 {creator.name}
              </span>
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-2">
            <span>PHASE: {phase}</span>
            <span className="text-cyan-500">{progress}%</span>
          </div>
          <div className="h-1 bg-[#222] rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-end">
            <span className="bg-[#1A1D21] hover:bg-[#222] text-white text-xs font-bold px-4 py-2 rounded border border-[#333] transition-colors">
              OPEN PROJECT
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function PaperRow({
  href,
  title,
  authors,
  year,
  source,
  doi,
}: {
  href: string;
  title: string;
  authors: string;
  year: string;
  source: string;
  doi?: string;
}) {
  return (
    <Link href={href} className="block">
      <div className="bg-[#0F1115] border border-[#262626] rounded-xl p-0 overflow-hidden hover:border-cyan-500/50 transition-colors flex group cursor-pointer">
        <div className="w-16 bg-[#0A0A0A] border-r border-[#262626] flex flex-col items-center justify-center p-4">
          <span className="text-[10px] font-bold text-gray-500 uppercase mb-1">
            YEAR
          </span>
          <span className="text-lg font-bold text-white">{year}</span>
        </div>
        <div className="flex-1 p-5 relative">
          <Bookmark className="absolute top-5 right-5 w-5 h-5 text-gray-600 hover:text-cyan-500 cursor-pointer" onClick={(e) => e.preventDefault()} />
          <h3 className="text-base font-bold text-white mb-2 pr-8 line-clamp-1 group-hover:text-cyan-400 transition-colors">
            {title}
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-[#1A1D21] text-cyan-500 text-[10px] font-bold px-2 py-1 rounded border border-cyan-900/20">
              {source}
            </span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500 font-medium">{authors}</span>
            {doi && (
              <>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-600 font-mono">
                  DOI: {doi}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function ActivityItem({
  initials,
  bg,
  name,
  action,
  time,
}: {
  initials: string;
  bg: string;
  name: string;
  action: string;
  time: string;
}) {
  return (
    <div className="flex gap-3">
      <div
        className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center text-xs font-bold text-white shrink-0`}
      >
        {initials}
      </div>
      <div>
        <p className="text-sm font-medium text-white leading-tight">
          <span className="font-bold">{name}</span> {action}
        </p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  );
}
