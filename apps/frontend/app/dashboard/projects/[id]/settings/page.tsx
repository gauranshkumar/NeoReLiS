"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  Trash2,
  Archive,
  AlertTriangle,
  CheckCircle2,
  Settings2,
  Shield,
  Sliders,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { projectApi, Project, ProjectSettings } from "@/lib/api";
import { useTranslations } from "next-intl";

type SettingsTab = "general" | "workflow" | "danger";

export default function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [settings, setSettings] = useState<ProjectSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  // General form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("DRAFT");

  // Workflow form state
  const [screeningOn, setScreeningOn] = useState(false);
  const [screeningReviewerNum, setScreeningReviewerNum] = useState(2);
  const [screeningConflictType, setScreeningConflictType] = useState("INCLUDE_EXCLUDE");
  const [screeningConflictRes, setScreeningConflictRes] = useState("UNANIMITY");
  const [screeningValidationOn, setScreeningValidationOn] = useState(true);
  const [validationDefaultPercent, setValidationDefaultPercent] = useState(20);
  const [classificationOn, setClassificationOn] = useState(false);
  const [importPapersOn, setImportPapersOn] = useState(true);
  const [sourcePapersOn, setSourcePapersOn] = useState(false);

  // Save state
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveError, setSaveError] = useState("");

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const t = useTranslations("projects.settings");
  const tErr = useTranslations("errors");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !id) return;
    setIsLoading(true);
    try {
      const [projectRes, settingsRes] = await Promise.all([
        projectApi.get(id),
        projectApi.getSettings(id),
      ]);

      if (projectRes.error) {
        setError(projectRes.error.message);
        return;
      }

      if (projectRes.data) {
        const p = projectRes.data.project;
        setProject(p);
        setTitle(p.title);
        setDescription(p.description || "");
        setStatus(p.status);
      }

      if (settingsRes.data) {
        const s = settingsRes.data.settings;
        setSettings(s);
        setScreeningOn(s.screeningOn);
        setScreeningReviewerNum(s.screeningReviewerNum);
        setScreeningConflictType(s.screeningConflictType);
        setScreeningConflictRes(s.screeningConflictRes);
        setScreeningValidationOn(s.screeningValidationOn);
        setValidationDefaultPercent(s.validationDefaultPercent);
        setClassificationOn(s.classificationOn);
        setImportPapersOn(s.importPapersOn);
        setSourcePapersOn(s.sourcePapersOn);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const clearMessages = () => {
    setSaveMsg("");
    setSaveError("");
  };

  const handleSaveGeneral = async () => {
    clearMessages();
    setSaving(true);
    try {
      const res = await projectApi.update(id, { title, description, status });
      if (res.error) {
        setSaveError(res.error.message);
      } else {
        setSaveMsg(t("projectDetailsSaved"));
        if (res.data) setProject(res.data.project);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWorkflow = async () => {
    clearMessages();
    setSaving(true);
    try {
      const res = await projectApi.updateSettings(id, {
        screeningOn,
        screeningReviewerNum,
        screeningConflictType,
        screeningConflictRes,
        screeningValidationOn,
        validationDefaultPercent,
        classificationOn,
        importPapersOn,
        sourcePapersOn,
      });
      if (res.error) {
        setSaveError(res.error.message);
      } else {
        setSaveMsg(t("workflowSettingsSaved"));
        if (res.data) setSettings(res.data.settings);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    setArchiving(true);
    try {
      const res = await projectApi.delete(id);
      if (res.error) {
        setSaveError(res.error.message);
      } else {
        router.push("/dashboard/projects");
      }
    } finally {
      setArchiving(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (deleteInput !== project?.title) return;
    setDeleting(true);
    try {
      const res = await projectApi.permanentDelete(id);
      if (res.error) {
        setSaveError(res.error.message);
      } else {
        router.push("/dashboard/projects");
      }
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>
        <div className="p-12 bg-[#1A1D21] border border-[#262626] rounded-xl text-center">
          <h2 className="text-xl font-bold text-white mb-2">{tErr("notFound")}</h2>
          <p className="text-gray-400 text-sm">
            {error || tErr("projectNotFoundOrNoAccess")}
          </p>
        </div>
      </div>
    );
  }

  const tabs: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { key: "general", label: t("general"), icon: <Settings2 className="w-4 h-4" /> },
    { key: "workflow", label: t("workflow"), icon: <Sliders className="w-4 h-4" /> },
    { key: "danger", label: t("dangerZone"), icon: <Shield className="w-4 h-4" /> },
  ];

  const hasGeneralChanges =
    title !== project.title ||
    description !== (project.description || "") ||
    status !== project.status;

  const hasWorkflowChanges =
    settings !== null &&
    (screeningOn !== settings.screeningOn ||
      screeningReviewerNum !== settings.screeningReviewerNum ||
      screeningConflictType !== settings.screeningConflictType ||
      screeningConflictRes !== settings.screeningConflictRes ||
      screeningValidationOn !== settings.screeningValidationOn ||
      validationDefaultPercent !== settings.validationDefaultPercent ||
      classificationOn !== settings.classificationOn ||
      importPapersOn !== settings.importPapersOn ||
      sourcePapersOn !== settings.sourcePapersOn);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <Link
        href={`/dashboard/projects/${id}`}
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> {t("backToProject")}
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">{t("projectSettings")}</h1>
        <p className="text-gray-500 text-sm">{project.title}</p>
      </div>

      {/* Toast messages */}
      {saveMsg && (
        <div className="mb-4 flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {saveMsg}
        </div>
      )}
      {saveError && (
        <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {saveError}
        </div>
      )}

      {/* Tabs + Content */}
      <div className="flex gap-8">
        {/* Sidebar */}
        <nav className="w-48 shrink-0">
          <ul className="space-y-1">
            {tabs.map((tab) => (
              <li key={tab.key}>
                <button
                  onClick={() => {
                    setActiveTab(tab.key);
                    clearMessages();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                      : tab.key === "danger"
                        ? "text-red-400 hover:bg-red-500/10 border border-transparent"
                        : "text-gray-400 hover:bg-[#1A1D21] border border-transparent"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* ─── General Tab ─── */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="bg-[#1A1D21] border border-[#262626] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6">
                  {t("generalInformation")}
                </h2>

                {/* Title */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t("projectName")}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    placeholder={t("projectNamePlaceholder")}
                  />
                </div>

                {/* Description */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t("description")}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                    placeholder={t("descriptionPlaceholder")}
                  />
                </div>

                {/* Status */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t("status")}
                  </label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED")
                    }
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                  >
                    <option value="DRAFT">{t("statusDraft")}</option>
                    <option value="PUBLISHED">{t("statusPublished")}</option>
                    <option value="ARCHIVED">{t("statusArchived")}</option>
                  </select>
                </div>

                {/* Label (read-only) */}
                <div className="mb-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t("projectLabel")}
                  </label>
                  <input
                    type="text"
                    value={project.label}
                    disabled
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-4 py-2.5 text-gray-500 text-sm cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    {t("labelCannotChange")}
                  </p>
                </div>
              </div>

              {/* Save button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveGeneral}
                  disabled={saving || !hasGeneralChanges || !title.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {t("saveChanges")}
                </button>
              </div>
            </div>
          )}

          {/* ─── Workflow Tab ─── */}
          {activeTab === "workflow" && (
            <div className="space-y-6">
              {/* Import & Source */}
              <div className="bg-[#1A1D21] border border-[#262626] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6">
                  {t("importAndSources")}
                </h2>
                <div className="space-y-4">
                  <Toggle
                    label={t("importPapers")}
                    description={t("importPapersDesc")}
                    checked={importPapersOn}
                    onChange={setImportPapersOn}
                  />
                  <Toggle
                    label={t("sourcePapers")}
                    description={t("sourcePapersDesc")}
                    checked={sourcePapersOn}
                    onChange={setSourcePapersOn}
                  />
                </div>
              </div>

              {/* Screening */}
              <div className="bg-[#1A1D21] border border-[#262626] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6">
                  {t("screening")}
                </h2>
                <div className="space-y-5">
                  <Toggle
                    label={t("enableScreening")}
                    description={t("enableScreeningDesc")}
                    checked={screeningOn}
                    onChange={setScreeningOn}
                  />

                  {screeningOn && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {t("reviewersPerPaper")}
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={screeningReviewerNum}
                          onChange={(e) =>
                            setScreeningReviewerNum(
                              Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
                            )
                          }
                          className="w-32 bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {t("conflictType")}
                        </label>
                        <select
                          value={screeningConflictType}
                          onChange={(e) => setScreeningConflictType(e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                        >
                          <option value="INCLUDE_EXCLUDE">{t("includeExclude")}</option>
                          <option value="CRITERIA_BASED">{t("criteriaBased")}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {t("conflictResolution")}
                        </label>
                        <select
                          value={screeningConflictRes}
                          onChange={(e) => setScreeningConflictRes(e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                        >
                          <option value="UNANIMITY">{t("unanimity")}</option>
                          <option value="MAJORITY">{t("majority")}</option>
                        </select>
                      </div>

                      <Toggle
                        label={t("screeningValidation")}
                        description={t("screeningValidationDesc")}
                        checked={screeningValidationOn}
                        onChange={setScreeningValidationOn}
                      />

                      {screeningValidationOn && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            {t("validationPercentage")}
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={5}
                              value={validationDefaultPercent}
                              onChange={(e) =>
                                setValidationDefaultPercent(parseInt(e.target.value))
                              }
                              className="flex-1 accent-cyan-500"
                            />
                            <span className="text-white text-sm font-medium w-12 text-right">
                              {validationDefaultPercent}%
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Classification / Extraction */}
              <div className="bg-[#1A1D21] border border-[#262626] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6">
                  {t("dataExtraction")}
                </h2>
                <Toggle
                  label={t("enableDataExtraction")}
                  description={t("enableDataExtractionDesc")}
                  checked={classificationOn}
                  onChange={setClassificationOn}
                />
              </div>

              {/* Save button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveWorkflow}
                  disabled={saving || !hasWorkflowChanges}
                  className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {t("saveWorkflowSettings")}
                </button>
              </div>
            </div>
          )}

          {/* ─── Danger Zone Tab ─── */}
          {activeTab === "danger" && (
            <div className="space-y-6">
              {/* Archive */}
              {project.status !== "ARCHIVED" && (
                <div className="bg-[#1A1D21] border border-yellow-500/30 rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-semibold mb-1">
                        {t("archiveThisProject")}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
                        {t("archiveDescription")}
                      </p>
                    </div>
                    <button
                      onClick={handleArchive}
                      disabled={archiving}
                      className="flex items-center gap-2 px-4 py-2 border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 rounded-lg text-sm font-medium transition-colors shrink-0"
                    >
                      {archiving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Archive className="w-4 h-4" />
                      )}
                      {t("archiveProject")}
                    </button>
                  </div>
                </div>
              )}

              {/* Permanent Delete */}
              <div className="bg-[#1A1D21] border border-red-500/30 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold mb-1">
                      {t("deleteThisProject")}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
                      {t("deleteDescription")}{" "}
                      <span className="text-red-400 font-medium">{t("cannotBeUndone")}</span>
                    </p>
                  </div>
                </div>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t("deleteProject")}
                  </button>
                ) : (
                  <div className="mt-4 p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-3">
                      <AlertTriangle className="w-4 h-4" />
                      {t("areYouAbsolutelySure")}
                    </div>
                    <p className="text-gray-400 text-sm mb-3">
                      {t("typeToConfirm")}{" "}
                      <span className="text-white font-mono bg-[#0A0A0A] px-1.5 py-0.5 rounded">{project.title}</span>
                    </p>
                    <input
                      type="text"
                      value={deleteInput}
                      onChange={(e) => setDeleteInput(e.target.value)}
                      placeholder={t("enterProjectNameToConfirm")}
                      className="w-full bg-[#0A0A0A] border border-red-500/30 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-500/50 transition-colors mb-3"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handlePermanentDelete}
                        disabled={deleting || deleteInput !== project.title}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        {deleting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        {t("iUnderstandDelete")}
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteInput("");
                        }}
                        className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
                      >
                        {t("cancel")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Toggle Component ─── */
function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? "bg-cyan-600" : "bg-gray-700"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
