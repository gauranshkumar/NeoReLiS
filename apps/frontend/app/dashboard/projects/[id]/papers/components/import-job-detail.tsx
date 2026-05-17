"use client";

import { useMemo } from "react";
import {
    X,
    CheckCircle,
    AlertCircle,
    AlertTriangle,
    FileText,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ImportJob } from "@/lib/api";

interface ImportJobDetailProps {
    job: ImportJob;
    onClose: () => void;
}

interface ParsedError {
    row?: number;
    entry?: string;
    message: string;
}

export function ImportJobDetail({ job, onClose }: ImportJobDetailProps) {
    const t = useTranslations("papers.import");

    const errors: ParsedError[] = useMemo(() => {
        if (!job.errors) return [];
        if (typeof job.errors === "string") {
            try {
                return JSON.parse(job.errors);
            } catch {
                return [{ message: job.errors }];
            }
        }
        if (Array.isArray(job.errors)) return job.errors;
        return [];
    }, [job.errors]);

    const total = job.successRows + job.duplicateRows + job.errorRows;
    const successRate = total > 0 ? Math.round((job.successRows / total) * 100) : 0;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-[#141414] border border-[#262626] rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#262626]">
                    <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-cyan-500" />
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                {t("jobDetailTitle")}
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {job.filename}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#262626] transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Meta */}
                <div className="px-6 py-4 border-b border-[#262626] flex items-center gap-4 text-xs text-gray-500">
                    <span className="uppercase font-medium">{job.fileType}</span>
                    <span
                        className={`px-2 py-0.5 rounded ${
                            job.status === "COMPLETED"
                                ? "bg-green-500/20 text-green-400"
                                : job.status === "VALIDATED"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-yellow-500/20 text-yellow-400"
                        }`}
                    >
                        {job.status}
                    </span>
                    <span>{new Date(job.createdAt).toLocaleString()}</span>
                </div>

                {/* Stats */}
                <div className="p-6 border-b border-[#262626]">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-[#0d0d0d] rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-xs text-gray-400 uppercase tracking-wider">
                                    {t("imported")}
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-green-400">
                                {job.successRows}
                            </p>
                        </div>
                        <div className="p-4 bg-[#0d0d0d] rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                <span className="text-xs text-gray-400 uppercase tracking-wider">
                                    {t("duplicates")}
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-yellow-400">
                                {job.duplicateRows}
                            </p>
                        </div>
                        <div className="p-4 bg-[#0d0d0d] rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <span className="text-xs text-gray-400 uppercase tracking-wider">
                                    {t("errors")}
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-red-400">
                                {job.errorRows}
                            </p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    {total > 0 && (
                        <div className="mt-4">
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                                <span>{t("successRate")}</span>
                                <span>{successRate}%</span>
                            </div>
                            <div className="h-2 bg-[#0d0d0d] rounded-full overflow-hidden">
                                <div className="h-full flex">
                                    <div
                                        className="bg-green-500 transition-all"
                                        style={{ width: `${(job.successRows / total) * 100}%` }}
                                    />
                                    <div
                                        className="bg-yellow-500 transition-all"
                                        style={{ width: `${(job.duplicateRows / total) * 100}%` }}
                                    />
                                    <div
                                        className="bg-red-500 transition-all"
                                        style={{ width: `${(job.errorRows / total) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Error List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {errors.length === 0 ? (
                        <div className="text-center py-8">
                            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
                            <p className="text-sm text-gray-400">
                                {t("jobNoErrors")}
                            </p>
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                                {t("jobErrorsTitle")} ({errors.length})
                            </h3>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {errors.map((err, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-3 p-3 bg-red-500/5 rounded-lg border border-red-500/20"
                                    >
                                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            {(err.row || err.entry) && (
                                                <p className="text-xs text-red-400 mb-1 font-medium">
                                                    {err.row
                                                        ? t("jobRow", { row: err.row })
                                                        : t("jobEntry", { entry: err.entry || "unknown" })}
                                                </p>
                                            )}
                                            <p className="text-sm text-gray-300 wrap-break-word">
                                                {err.message}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[#262626] flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-[#1a1a1a] hover:bg-[#262626] rounded-lg transition-colors"
                    >
                        {t("close")}
                    </button>
                </div>
            </div>
        </div>
    );
}
