"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { projectApi } from "@/lib/api";

// ─── Types mirroring the backend protocol schema ────────────────────

interface ProtocolProject {
  short_name: string;
  name: string;
  description: string;
}

interface ExclusionCriteria {
  name: string;
}

interface ScreeningPhase {
  title: string;
  description: string;
  fields: string[];
}

interface ProtocolScreening {
  review_per_paper: number;
  conflict_type: "Decision" | "Criteria";
  conflict_resolution: "Majority" | "Unanimity";
  exclusion_criteria: ExclusionCriteria[];
  source_papers: { name: string }[];
  search_strategy: { name: string }[];
  validation_percentage: number;
  validation_assignment_mode: "Normal" | "Veto" | "Info";
  phases: ScreeningPhase[];
}

interface QAResponse {
  title: string;
  score: number;
}

interface ProtocolQA {
  question: string[];
  response: QAResponse[];
  min_score: number;
}

// Category types
interface FreeCategory {
  category_type: "Simple";
  name: string;
  title: string;
  type: string;
  mandatory: boolean;
  numberOfValues?: number;
}

interface StaticCategory {
  category_type: "List";
  name: string;
  title: string;
  values: { name: string }[];
  mandatory: boolean;
  numberOfValues?: number;
}

interface DynamicCategory {
  category_type: "DynamicList";
  dynamic_subtype: "Independent";
  name: string;
  title: string;
  initial_values: string[];
  mandatory: boolean;
  numberOfValues?: number;
}

type ProtocolCategory = FreeCategory | StaticCategory | DynamicCategory;

interface SimpleReport {
  report_type: "Simple";
  name: string;
  title: string;
  value: string;
  chart: string[];
}

interface ComparedReport {
  report_type: "Compared";
  name: string;
  title: string;
  value: string;
  reference: string;
  chart: string[];
}

type ProtocolReport = SimpleReport | ComparedReport;

interface ReviewProtocol {
  project: ProtocolProject;
  screening?: ProtocolScreening;
  quality_assess?: ProtocolQA;
  category: ProtocolCategory[];
  reporting?: ProtocolReport[];
}

// ─── Steps ──────────────────────────────────────────────────────────

const STEPS = [
  { id: 0, label: "General", description: "Project info" },
  { id: 1, label: "Screening", description: "Review criteria" },
  { id: 2, label: "Quality Assessment", description: "QA questions" },
  { id: 3, label: "Data Extraction", description: "Classification fields" },
  { id: 4, label: "Reporting", description: "Charts & graphs" },
  { id: 5, label: "Review & Create", description: "Confirm settings" },
];

// ─── Default state ──────────────────────────────────────────────────

function defaultProtocol(): ReviewProtocol {
  return {
    project: { short_name: "", name: "", description: "" },
    screening: {
      review_per_paper: 2,
      conflict_type: "Decision",
      conflict_resolution: "Unanimity",
      exclusion_criteria: [{ name: "" }],
      source_papers: [],
      search_strategy: [],
      validation_percentage: 20,
      validation_assignment_mode: "Normal",
      phases: [],
    },
    quality_assess: undefined,
    category: [],
    reporting: [],
  };
}

// ─── Main Component ─────────────────────────────────────────────────

export default function NewProjectPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState(0);
  const [protocol, setProtocol] = useState<ReviewProtocol>(defaultProtocol);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [enableScreening, setEnableScreening] = useState(true);
  const [enableQA, setEnableQA] = useState(false);

  const updateProject = useCallback(
    (field: keyof ProtocolProject, value: string) => {
      setProtocol((prev) => ({
        ...prev,
        project: { ...prev.project, [field]: value },
      }));
    },
    []
  );

  const updateScreening = useCallback(
    (field: keyof ProtocolScreening, value: unknown) => {
      setProtocol((prev) => ({
        ...prev,
        screening: prev.screening
          ? { ...prev.screening, [field]: value }
          : undefined,
      }));
    },
    []
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    // Build final payload
    const payload: Record<string, unknown> = {
      project: protocol.project,
      category: protocol.category.length > 0
        ? protocol.category
        : [
            {
              category_type: "Simple" as const,
              name: "notes",
              title: "Notes",
              type: "text",
              mandatory: false,
            },
          ],
    };

    if (enableScreening && protocol.screening) {
      // Filter out empty criteria
      const criteria = protocol.screening.exclusion_criteria.filter(
        (c) => c.name.trim() !== ""
      );
      payload.screening = {
        ...protocol.screening,
        exclusion_criteria: criteria.length > 0 ? criteria : [{ name: "Not relevant" }],
      };
    }

    if (enableQA && protocol.quality_assess) {
      payload.quality_assess = protocol.quality_assess;
    }

    if (protocol.reporting && protocol.reporting.length > 0) {
      // Filter out reports with empty value (required field referencing a category)
      const validReports = protocol.reporting.filter((r) => r.value && r.name);
      if (validReports.length > 0) {
        payload.reporting = validReports;
      }
    }

    const res = await projectApi.createFromProtocol(payload);

    if (res.error) {
      setError(res.error.message);
      setIsSubmitting(false);
      return;
    }

    // Success — redirect to the new project
    router.push(`/dashboard/projects`);
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  return (
    <div className="max-w-275 mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/dashboard/projects")}
          className="text-gray-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-white text-2xl font-bold">New Review</h1>
          <p className="text-gray-500 text-sm">
            Configure your systematic literature review protocol
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-1 mb-10 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStep(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              step === i
                ? "bg-cyan-500/10 text-cyan-500 border border-cyan-500/30"
                : step > i
                ? "bg-green-500/10 text-green-500 border border-green-500/20"
                : "bg-[#1A1D21] text-gray-500 border border-[#262626] hover:text-gray-300"
            }`}
          >
            {step > i ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
                {i + 1}
              </span>
            )}
            {s.label}
            {i < STEPS.length - 1 && (
              <ChevronRight className="w-3 h-3 text-gray-600 ml-1" />
            )}
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-[#1A1D21] border border-[#262626] rounded-xl p-8 min-h-125">
        {step === 0 && (
          <StepGeneral
            project={protocol.project}
            updateProject={updateProject}
          />
        )}
        {step === 1 && (
          <StepScreening
            screening={protocol.screening!}
            updateScreening={updateScreening}
            enabled={enableScreening}
            setEnabled={setEnableScreening}
          />
        )}
        {step === 2 && (
          <StepQA
            qa={protocol.quality_assess}
            setQA={(qa) =>
              setProtocol((prev) => ({ ...prev, quality_assess: qa }))
            }
            enabled={enableQA}
            setEnabled={setEnableQA}
          />
        )}
        {step === 3 && (
          <StepExtraction
            categories={protocol.category}
            setCategories={(cats) =>
              setProtocol((prev) => ({ ...prev, category: cats }))
            }
          />
        )}
        {step === 4 && (
          <StepReporting
            reports={protocol.reporting || []}
            setReports={(rpts) =>
              setProtocol((prev) => ({ ...prev, reporting: rpts }))
            }
            categories={protocol.category}
          />
        )}
        {step === 5 && (
          <StepReview
            protocol={protocol}
            enableScreening={enableScreening}
            enableQA={enableQA}
          />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="px-6 py-2.5 rounded-lg text-sm font-medium bg-[#1A1D21] text-gray-400 border border-[#333] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <span className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Previous
          </span>
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            className="px-6 py-2.5 rounded-lg text-sm font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition-colors"
          >
            <span className="flex items-center gap-2">
              Next <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !protocol.project.short_name || !protocol.project.name}
            className="px-8 py-2.5 rounded-lg text-sm font-bold bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Creating…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" /> Create Review
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Step: General ──────────────────────────────────────────────────

function StepGeneral({
  project,
  updateProject,
}: {
  project: ProtocolProject;
  updateProject: (field: keyof ProtocolProject, value: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-lg font-bold mb-1">Project Information</h2>
        <p className="text-gray-500 text-sm">
          Define the basic details of your systematic review.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Short Name / Label *
          </label>
          <input
            type="text"
            value={project.short_name}
            onChange={(e) =>
              updateProject(
                "short_name",
                e.target.value.replace(/[^a-zA-Z0-9_]/g, "")
              )
            }
            placeholder="my_review"
            className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <p className="text-gray-600 text-xs mt-1">
            Letters, numbers, underscores only. Used as the project identifier.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Full Title *
          </label>
          <input
            type="text"
            value={project.name}
            onChange={(e) => updateProject("name", e.target.value)}
            placeholder="A Systematic Review of…"
            className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Description
        </label>
        <textarea
          value={project.description}
          onChange={(e) => updateProject("description", e.target.value)}
          rows={4}
          placeholder="Describe the scope and goals of your review…"
          className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors resize-none"
        />
      </div>
    </div>
  );
}

// ─── Step: Screening ────────────────────────────────────────────────

function StepScreening({
  screening,
  updateScreening,
  enabled,
  setEnabled,
}: {
  screening: ProtocolScreening;
  updateScreening: (field: keyof ProtocolScreening, value: unknown) => void;
  enabled: boolean;
  setEnabled: (v: boolean) => void;
}) {
  const addCriteria = () => {
    updateScreening("exclusion_criteria", [
      ...screening.exclusion_criteria,
      { name: "" },
    ]);
  };

  const updateCriteria = (index: number, value: string) => {
    const updated = [...screening.exclusion_criteria];
    updated[index] = { name: value };
    updateScreening("exclusion_criteria", updated);
  };

  const removeCriteria = (index: number) => {
    const updated = screening.exclusion_criteria.filter((_, i) => i !== index);
    updateScreening("exclusion_criteria", updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-lg font-bold mb-1">Screening Configuration</h2>
          <p className="text-gray-500 text-sm">
            Set up paper review rules and exclusion criteria.
          </p>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <span className="text-sm text-gray-400">
            {enabled ? "Enabled" : "Disabled"}
          </span>
          <div
            onClick={() => setEnabled(!enabled)}
            className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${
              enabled ? "bg-cyan-500" : "bg-[#333]"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                enabled ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </div>
        </label>
      </div>

      {enabled && (
        <>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Reviewers per Paper
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={screening.review_per_paper}
                onChange={(e) =>
                  updateScreening(
                    "review_per_paper",
                    parseInt(e.target.value) || 1
                  )
                }
                className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Validation Percentage
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={screening.validation_percentage}
                onChange={(e) =>
                  updateScreening(
                    "validation_percentage",
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Conflict Type
              </label>
              <select
                value={screening.conflict_type}
                onChange={(e) =>
                  updateScreening("conflict_type", e.target.value)
                }
                className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="Decision">Decision</option>
                <option value="Criteria">Criteria</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Conflict Resolution
              </label>
              <select
                value={screening.conflict_resolution}
                onChange={(e) =>
                  updateScreening("conflict_resolution", e.target.value)
                }
                className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="Unanimity">Unanimity</option>
                <option value="Majority">Majority</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Validation Mode
              </label>
              <select
                value={screening.validation_assignment_mode}
                onChange={(e) =>
                  updateScreening("validation_assignment_mode", e.target.value)
                }
                className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="Normal">Normal</option>
                <option value="Veto">Veto</option>
                <option value="Info">Info</option>
              </select>
            </div>
          </div>

          {/* Exclusion Criteria */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Exclusion Criteria
            </label>
            <div className="space-y-2">
              {screening.exclusion_criteria.map((criterion, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={criterion.name}
                    onChange={(e) => updateCriteria(i, e.target.value)}
                    placeholder={`Criterion ${i + 1}`}
                    className="flex-1 bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                  {screening.exclusion_criteria.length > 1 && (
                    <button
                      onClick={() => removeCriteria(i)}
                      className="px-3 py-2 text-red-400 hover:text-red-300 text-sm"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addCriteria}
              className="mt-3 text-xs text-cyan-500 hover:text-cyan-400 font-medium"
            >
              + Add Criterion
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Step: QA ───────────────────────────────────────────────────────

function StepQA({
  qa,
  setQA,
  enabled,
  setEnabled,
}: {
  qa: ProtocolQA | undefined;
  setQA: (qa: ProtocolQA | undefined) => void;
  enabled: boolean;
  setEnabled: (v: boolean) => void;
}) {
  const current: ProtocolQA = qa || {
    question: [""],
    response: [
      { title: "Yes", score: 1 },
      { title: "Partially", score: 0.5 },
      { title: "No", score: 0 },
    ],
    min_score: 0,
  };

  const update = (changes: Partial<ProtocolQA>) => {
    setQA({ ...current, ...changes });
  };

  const toggleEnabled = (v: boolean) => {
    setEnabled(v);
    if (v && !qa) {
      setQA(current);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-lg font-bold mb-1">Quality Assessment</h2>
          <p className="text-gray-500 text-sm">
            Define questions to assess the quality of included papers.
          </p>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <span className="text-sm text-gray-400">
            {enabled ? "Enabled" : "Disabled"}
          </span>
          <div
            onClick={() => toggleEnabled(!enabled)}
            className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${
              enabled ? "bg-cyan-500" : "bg-[#333]"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                enabled ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </div>
        </label>
      </div>

      {enabled && (
        <>
          {/* Questions */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Questions
            </label>
            <div className="space-y-2">
              {current.question.map((q, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-gray-500 text-sm py-2.5 w-8 text-right">
                    Q{i + 1}
                  </span>
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => {
                      const updated = [...current.question];
                      updated[i] = e.target.value;
                      update({ question: updated });
                    }}
                    placeholder="Enter your quality assessment question…"
                    className="flex-1 bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                  {current.question.length > 1 && (
                    <button
                      onClick={() => {
                        update({
                          question: current.question.filter((_, j) => j !== i),
                        });
                      }}
                      className="px-3 text-red-400 hover:text-red-300 text-sm"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() =>
                update({ question: [...current.question, ""] })
              }
              className="mt-3 text-xs text-cyan-500 hover:text-cyan-400 font-medium"
            >
              + Add Question
            </button>
          </div>

          {/* Responses */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Response Options
            </label>
            <div className="space-y-2">
              {current.response.map((r, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={r.title}
                    onChange={(e) => {
                      const updated = [...current.response];
                      updated[i] = { ...r, title: e.target.value };
                      update({ response: updated });
                    }}
                    placeholder="Response label"
                    className="flex-1 bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500 text-xs">Score:</span>
                    <input
                      type="number"
                      step="0.5"
                      value={r.score}
                      onChange={(e) => {
                        const updated = [...current.response];
                        updated[i] = {
                          ...r,
                          score: parseFloat(e.target.value) || 0,
                        };
                        update({ response: updated });
                      }}
                      className="w-20 bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  {current.response.length > 2 && (
                    <button
                      onClick={() => {
                        update({
                          response: current.response.filter((_, j) => j !== i),
                        });
                      }}
                      className="px-2 text-red-400 hover:text-red-300 text-sm"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() =>
                update({
                  response: [...current.response, { title: "", score: 0 }],
                })
              }
              className="mt-3 text-xs text-cyan-500 hover:text-cyan-400 font-medium"
            >
              + Add Response
            </button>
          </div>

          {/* Min Score */}
          <div className="max-w-xs">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Minimum Score (Cutoff)
            </label>
            <input
              type="number"
              step="0.5"
              value={current.min_score}
              onChange={(e) =>
                update({ min_score: parseFloat(e.target.value) || 0 })
              }
              className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>
        </>
      )}
    </div>
  );
}

// ─── Step: Data Extraction ──────────────────────────────────────────

function StepExtraction({
  categories,
  setCategories,
}: {
  categories: ProtocolCategory[];
  setCategories: (cats: ProtocolCategory[]) => void;
}) {
  const addField = (type: "Simple" | "List" | "DynamicList") => {
    if (type === "Simple") {
      setCategories([
        ...categories,
        {
          category_type: "Simple",
          name: "",
          title: "",
          type: "string",
          mandatory: false,
        },
      ]);
    } else if (type === "List") {
      setCategories([
        ...categories,
        {
          category_type: "List",
          name: "",
          title: "",
          values: [{ name: "" }, { name: "" }],
          mandatory: false,
        },
      ]);
    } else {
      setCategories([
        ...categories,
        {
          category_type: "DynamicList",
          dynamic_subtype: "Independent",
          name: "",
          title: "",
          initial_values: [""],
          mandatory: false,
        },
      ]);
    }
  };

  const removeField = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const updateField = (index: number, changes: Partial<ProtocolCategory>) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], ...changes } as ProtocolCategory;
    setCategories(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-lg font-bold mb-1">Data Extraction Fields</h2>
        <p className="text-gray-500 text-sm">
          Define the classification schema for your data extraction. These map
          to the &quot;category&quot; block in the DSL.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-[#262626] rounded-xl">
          <p className="text-gray-500 mb-4">
            No extraction fields yet. Add your first field to get started.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => addField("Simple")}
              className="px-4 py-2 bg-[#0A0A0A] border border-[#333] rounded-lg text-xs text-white hover:border-cyan-500 transition-colors"
            >
              + Simple Field
            </button>
            <button
              onClick={() => addField("List")}
              className="px-4 py-2 bg-[#0A0A0A] border border-[#333] rounded-lg text-xs text-white hover:border-cyan-500 transition-colors"
            >
              + List Field
            </button>
            <button
              onClick={() => addField("DynamicList")}
              className="px-4 py-2 bg-[#0A0A0A] border border-[#333] rounded-lg text-xs text-white hover:border-cyan-500 transition-colors"
            >
              + Dynamic List
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat, i) => (
            <div
              key={i}
              className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    cat.category_type === "Simple"
                      ? "bg-blue-500/20 text-blue-400"
                      : cat.category_type === "List"
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-orange-500/20 text-orange-400"
                  }`}
                >
                  {cat.category_type === "DynamicList"
                    ? "Dynamic List"
                    : cat.category_type}
                </span>
                <button
                  onClick={() => removeField(i)}
                  className="text-gray-500 hover:text-red-400 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Name (ID)
                  </label>
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) =>
                      updateField(i, {
                        name: e.target.value.replace(/[^a-zA-Z0-9_]/g, ""),
                      })
                    }
                    placeholder="field_name"
                    className="w-full bg-[#1A1D21] border border-[#333] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={cat.title}
                    onChange={(e) => updateField(i, { title: e.target.value })}
                    placeholder="Display Title"
                    className="w-full bg-[#1A1D21] border border-[#333] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex items-end gap-4">
                  {cat.category_type === "Simple" && (
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                        Type
                      </label>
                      <select
                        value={cat.type}
                        onChange={(e) =>
                          updateField(i, { type: e.target.value } as Partial<FreeCategory>)
                        }
                        className="w-full bg-[#1A1D21] border border-[#333] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                      >
                        <option value="string">String</option>
                        <option value="text">Text</option>
                        <option value="int">Integer</option>
                        <option value="real">Real</option>
                        <option value="bool">Boolean</option>
                        <option value="date">Date</option>
                      </select>
                    </div>
                  )}
                  <label className="flex items-center gap-2 pb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cat.mandatory}
                      onChange={(e) =>
                        updateField(i, { mandatory: e.target.checked })
                      }
                      className="accent-cyan-500"
                    />
                    <span className="text-xs text-gray-400">Required</span>
                  </label>
                </div>
              </div>

              {/* List values */}
              {cat.category_type === "List" && (
                <div className="mt-3">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">
                    Values
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {cat.values.map((v, vi) => (
                      <div key={vi} className="flex items-center gap-1">
                        <input
                          type="text"
                          value={v.name}
                          onChange={(e) => {
                            const updated = [...cat.values];
                            updated[vi] = { name: e.target.value };
                            updateField(i, { values: updated } as Partial<StaticCategory>);
                          }}
                          placeholder={`Value ${vi + 1}`}
                          className="w-32 bg-[#1A1D21] border border-[#333] rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-500"
                        />
                        {cat.values.length > 2 && (
                          <button
                            onClick={() => {
                              updateField(i, {
                                values: cat.values.filter((_, j) => j !== vi),
                              } as Partial<StaticCategory>);
                            }}
                            className="text-red-400 text-xs"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        updateField(i, {
                          values: [...cat.values, { name: "" }],
                        } as Partial<StaticCategory>);
                      }}
                      className="text-xs text-cyan-500 hover:text-cyan-400 py-1.5"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              )}

              {/* Dynamic list initial values */}
              {cat.category_type === "DynamicList" && (
                <div className="mt-3">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">
                    Initial Values
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {cat.initial_values.map((v, vi) => (
                      <div key={vi} className="flex items-center gap-1">
                        <input
                          type="text"
                          value={v}
                          onChange={(e) => {
                            const updated = [...cat.initial_values];
                            updated[vi] = e.target.value;
                            updateField(i, {
                              initial_values: updated,
                            } as Partial<DynamicCategory>);
                          }}
                          placeholder={`Value ${vi + 1}`}
                          className="w-32 bg-[#1A1D21] border border-[#333] rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-500"
                        />
                        {cat.initial_values.length > 1 && (
                          <button
                            onClick={() => {
                              updateField(i, {
                                initial_values: cat.initial_values.filter(
                                  (_, j) => j !== vi
                                ),
                              } as Partial<DynamicCategory>);
                            }}
                            className="text-red-400 text-xs"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        updateField(i, {
                          initial_values: [...cat.initial_values, ""],
                        } as Partial<DynamicCategory>);
                      }}
                      className="text-xs text-cyan-500 hover:text-cyan-400 py-1.5"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-3">
            <button
              onClick={() => addField("Simple")}
              className="px-4 py-2 bg-[#0A0A0A] border border-[#333] rounded-lg text-xs text-white hover:border-cyan-500 transition-colors"
            >
              + Simple Field
            </button>
            <button
              onClick={() => addField("List")}
              className="px-4 py-2 bg-[#0A0A0A] border border-[#333] rounded-lg text-xs text-white hover:border-cyan-500 transition-colors"
            >
              + List Field
            </button>
            <button
              onClick={() => addField("DynamicList")}
              className="px-4 py-2 bg-[#0A0A0A] border border-[#333] rounded-lg text-xs text-white hover:border-cyan-500 transition-colors"
            >
              + Dynamic List
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step: Reporting ────────────────────────────────────────────────

function StepReporting({
  reports,
  setReports,
  categories,
}: {
  reports: ProtocolReport[];
  setReports: (rpts: ProtocolReport[]) => void;
  categories: ProtocolCategory[];
}) {
  const categoryNames = categories.map((c) => c.name).filter(Boolean);

  const addReport = (type: "Simple" | "Compared") => {
    const defaultValue = categoryNames[0] || "";
    if (type === "Simple") {
      setReports([
        ...reports,
        {
          report_type: "Simple",
          name: `report_${reports.length + 1}`,
          title: "",
          value: defaultValue,
          chart: ["bar"],
        },
      ]);
    } else {
      setReports([
        ...reports,
        {
          report_type: "Compared",
          name: `report_${reports.length + 1}`,
          title: "",
          value: defaultValue,
          reference: categoryNames[1] || defaultValue,
          chart: ["bar"],
        },
      ]);
    }
  };

  const updateReport = (index: number, changes: Partial<ProtocolReport>) => {
    const updated = [...reports];
    updated[index] = { ...updated[index], ...changes } as ProtocolReport;
    setReports(updated);
  };

  const CHART_OPTIONS = ["bar", "pie", "line"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-lg font-bold mb-1">Reporting Configuration</h2>
        <p className="text-gray-500 text-sm">
          Define charts and graphs for your synthesis reports. Each report
          references an extraction field.
        </p>
      </div>

      {categoryNames.length === 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-yellow-400 text-sm">
          Add extraction fields first (Step 4) to reference them in reports.
        </div>
      )}

      {reports.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-[#262626] rounded-xl">
          <p className="text-gray-500 mb-4">
            No reports configured. Reports are optional.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => addReport("Simple")}
              className="px-4 py-2 bg-[#0A0A0A] border border-[#333] rounded-lg text-xs text-white hover:border-cyan-500 transition-colors"
            >
              + Simple Graph
            </button>
            <button
              onClick={() => addReport("Compared")}
              className="px-4 py-2 bg-[#0A0A0A] border border-[#333] rounded-lg text-xs text-white hover:border-cyan-500 transition-colors"
            >
              + Comparison Graph
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report, i) => (
            <div
              key={i}
              className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    report.report_type === "Simple"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {report.report_type}
                </span>
                <button
                  onClick={() =>
                    setReports(reports.filter((_, j) => j !== i))
                  }
                  className="text-gray-500 hover:text-red-400 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Name (ID)
                  </label>
                  <input
                    type="text"
                    value={report.name}
                    onChange={(e) =>
                      updateReport(i, {
                        name: e.target.value.replace(/[^a-zA-Z0-9_]/g, ""),
                      })
                    }
                    placeholder="report_name"
                    className="w-full bg-[#1A1D21] border border-[#333] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={report.title || ""}
                    onChange={(e) =>
                      updateReport(i, { title: e.target.value })
                    }
                    placeholder="Display Title"
                    className="w-full bg-[#1A1D21] border border-[#333] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div
                className={`grid gap-4 mb-3 ${
                  report.report_type === "Compared"
                    ? "grid-cols-2"
                    : "grid-cols-1"
                }`}
              >
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Field (Value)
                  </label>
                  <select
                    value={report.value}
                    onChange={(e) =>
                      updateReport(i, { value: e.target.value })
                    }
                    className="w-full bg-[#1A1D21] border border-[#333] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Select a field</option>
                    {categoryNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                {report.report_type === "Compared" && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      Reference Field
                    </label>
                    <select
                      value={report.reference}
                      onChange={(e) =>
                        updateReport(i, {
                          reference: e.target.value,
                        } as Partial<ComparedReport>)
                      }
                      className="w-full bg-[#1A1D21] border border-[#333] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">Select a field</option>
                      {categoryNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Chart types */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">
                  Chart Types
                </label>
                <div className="flex gap-3">
                  {CHART_OPTIONS.map((chartType) => (
                    <label
                      key={chartType}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={report.chart.includes(chartType)}
                        onChange={(e) => {
                          const newCharts = e.target.checked
                            ? [...report.chart, chartType]
                            : report.chart.filter((c) => c !== chartType);
                          updateReport(i, {
                            chart: newCharts.length > 0 ? newCharts : ["bar"],
                          });
                        }}
                        className="accent-cyan-500"
                      />
                      <span className="text-xs text-gray-400 capitalize">
                        {chartType}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="flex gap-3">
            <button
              onClick={() => addReport("Simple")}
              className="px-4 py-2 bg-[#0A0A0A] border border-[#333] rounded-lg text-xs text-white hover:border-cyan-500 transition-colors"
            >
              + Simple Graph
            </button>
            <button
              onClick={() => addReport("Compared")}
              className="px-4 py-2 bg-[#0A0A0A] border border-[#333] rounded-lg text-xs text-white hover:border-cyan-500 transition-colors"
            >
              + Comparison Graph
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step: Review ───────────────────────────────────────────────────

function StepReview({
  protocol,
  enableScreening,
  enableQA,
}: {
  protocol: ReviewProtocol;
  enableScreening: boolean;
  enableQA: boolean;
}) {
  const sections = [
    {
      title: "Project",
      items: [
        { label: "Short Name", value: protocol.project.short_name || "—" },
        { label: "Title", value: protocol.project.name || "—" },
        {
          label: "Description",
          value: protocol.project.description || "—",
        },
      ],
    },
    ...(enableScreening && protocol.screening
      ? [
          {
            title: "Screening",
            items: [
              {
                label: "Reviewers/Paper",
                value: String(protocol.screening.review_per_paper),
              },
              {
                label: "Conflict Type",
                value: protocol.screening.conflict_type,
              },
              {
                label: "Conflict Resolution",
                value: protocol.screening.conflict_resolution,
              },
              {
                label: "Exclusion Criteria",
                value:
                  protocol.screening.exclusion_criteria
                    .filter((c) => c.name)
                    .map((c) => c.name)
                    .join(", ") || "None",
              },
              {
                label: "Validation %",
                value: `${protocol.screening.validation_percentage}%`,
              },
            ],
          },
        ]
      : []),
    ...(enableQA && protocol.quality_assess
      ? [
          {
            title: "Quality Assessment",
            items: [
              {
                label: "Questions",
                value: String(
                  protocol.quality_assess.question.filter(Boolean).length
                ),
              },
              {
                label: "Response Options",
                value: protocol.quality_assess.response
                  .map((r) => `${r.title} (${r.score})`)
                  .join(", "),
              },
              {
                label: "Min Score",
                value: String(protocol.quality_assess.min_score),
              },
            ],
          },
        ]
      : []),
    {
      title: "Data Extraction",
      items:
        protocol.category.length > 0
          ? protocol.category.map((cat) => ({
              label: cat.name || "(unnamed)",
              value: `${cat.category_type}${cat.mandatory ? " (required)" : ""}`,
            }))
          : [{ label: "Fields", value: "Default (notes)" }],
    },
    ...(protocol.reporting && protocol.reporting.length > 0
      ? [
          {
            title: "Reporting",
            items: protocol.reporting.map((r) => ({
              label: r.name || "(unnamed)",
              value: `${r.report_type} — ${r.chart.join(", ")}`,
            })),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-lg font-bold mb-1">Review Configuration</h2>
        <p className="text-gray-500 text-sm">
          Verify your protocol settings before creating the project.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-5"
          >
            <h3 className="text-xs font-bold text-cyan-500 uppercase tracking-wider mb-4">
              {section.title}
            </h3>
            <div className="space-y-2">
              {section.items.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-xs text-gray-500">{item.label}</span>
                  <span className="text-xs text-white text-right max-w-[60%] truncate">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* JSON Preview Toggle */}
      <details className="group">
        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">
          Show JSON Protocol (for debugging / CLI reference)
        </summary>
        <pre className="mt-3 bg-[#0A0A0A] border border-[#262626] rounded-lg p-4 text-xs text-gray-400 overflow-auto max-h-96">
          {JSON.stringify(
            {
              project: protocol.project,
              ...(enableScreening && protocol.screening
                ? {
                    screening: {
                      ...protocol.screening,
                      exclusion_criteria:
                        protocol.screening.exclusion_criteria.filter(
                          (c) => c.name.trim() !== ""
                        ),
                    },
                  }
                : {}),
              ...(enableQA && protocol.quality_assess
                ? { quality_assess: protocol.quality_assess }
                : {}),
              category:
                protocol.category.length > 0
                  ? protocol.category
                  : [
                      {
                        category_type: "Simple",
                        name: "notes",
                        title: "Notes",
                        type: "text",
                        mandatory: false,
                      },
                    ],
              ...(protocol.reporting && protocol.reporting.length > 0
                ? { reporting: protocol.reporting }
                : {}),
            },
            null,
            2
          )}
        </pre>
      </details>
    </div>
  );
}
