"use client";

import { useState } from "react";
import Link from "next/link";
import {
    CheckCircle,
    AlertCircle,
    AlertTriangle,
    FileText,
    ChevronDown,
    ChevronRight,
    ExternalLink,
    RefreshCw,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface ImportResultsProps {
    result: {
        imported: number;
        duplicates: number;
        errors: { row?: number; entry?: string; message: string }[];
        importJobId: string;
    };
    onClose: () => void;
    projectId: string;
}

export function ImportResults({ result, onClose, projectId }: ImportResultsProps) {
    const t = useTranslations("papers.import");
    const [showErrors, setShowErrors] = useState(false);

    const total = result.imported + result.duplicates + result.errors.length;
    const successRate = total > 0 ? Math.round((result.imported / total) * 100) : 0;

    const isSuccess = result.imported > 0 && result.errors.length === 0;
    const hasWarnings = result.duplicates > 0 || result.errors.length > 0;

    return (
        <div className="bg-[#1a1a1a] rounded-xl border border-[#262626] overflow-hidden">
            {/* Header */}
            <div
                className={`p-6 ${
                    isSuccess
                        ? "bg-linear-to-r from-green-500/10 to-transparent"
                        : hasWarnings
                        ? "bg-linear-to-r from-yellow-500/10 to-transparent"
                        : "bg-linear-to-r from-red-500/10 to-transparent"
                }`}
            >
                <div className="flex items-start gap-4">
                    <div
                        className={`p-3 rounded-full ${
                            isSuccess
                                ? "bg-green-500/20"
                                : hasWarnings
                                ? "bg-yellow-500/20"
                                : "bg-red-500/20"
                        }`}
                    >
                        {isSuccess ? (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : hasWarnings ? (
                            <AlertTriangle className="h-6 w-6 text-yellow-500" />
                        ) : (
                            <AlertCircle className="h-6 w-6 text-red-500" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">
                            {isSuccess
                                ? t("importSuccess")
                                : result.imported > 0
                                ? t("importPartialSuccess")
                                : t("importFailed")}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                            {t("importSummary", {
                                imported: result.imported,
                                total,
                            })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="p-6 border-b border-[#262626]">
                <div className="grid grid-cols-3 gap-4">
                    {/* Imported */}
                    <div className="p-4 bg-[#0d0d0d] rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-xs text-gray-400 uppercase tracking-wider">
                                {t("imported")}
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-green-400">
                            {result.imported}
                        </p>
                    </div>

                    {/* Duplicates */}
                    <div className="p-4 bg-[#0d0d0d] rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span className="text-xs text-gray-400 uppercase tracking-wider">
                                {t("duplicates")}
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-400">
                            {result.duplicates}
                        </p>
                    </div>

                    {/* Errors */}
                    <div className="p-4 bg-[#0d0d0d] rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span className="text-xs text-gray-400 uppercase tracking-wider">
                                {t("errors")}
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-red-400">
                            {result.errors.length}
                        </p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                        <span>{t("successRate")}</span>
                        <span>{successRate}%</span>
                    </div>
                    <div className="h-2 bg-[#0d0d0d] rounded-full overflow-hidden">
                        <div className="h-full flex">
                            <div
                                className="bg-green-500 transition-all"
                                style={{
                                    width: `${(result.imported / total) * 100}%`,
                                }}
                            />
                            <div
                                className="bg-yellow-500 transition-all"
                                style={{
                                    width: `${(result.duplicates / total) * 100}%`,
                                }}
                            />
                            <div
                                className="bg-red-500 transition-all"
                                style={{
                                    width: `${(result.errors.length / total) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Errors section */}
            {result.errors.length > 0 && (
                <div className="p-6 border-b border-[#262626]">
                    <button
                        onClick={() => setShowErrors(!showErrors)}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        {showErrors ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                        {t("viewErrors", { count: result.errors.length })}
                    </button>

                    {showErrors && (
                        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                            {result.errors.map((error, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 p-3 bg-red-500/5 rounded-lg border border-red-500/20"
                                >
                                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        {(error.row || error.entry) && (
                                            <p className="text-xs text-red-400 mb-1">
                                                {error.row
                                                    ? `Row ${error.row}`
                                                    : `Entry: ${error.entry}`}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-300">
                                            {error.message}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="p-6 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                    {t("importJobId")}: {result.importJobId.substring(0, 8)}...
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <RefreshCw className="h-4 w-4" />
                        {t("importMore")}
                    </button>
                    <Link
                        href={`/dashboard/projects/${projectId}`}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        <FileText className="h-4 w-4" />
                        {t("viewPapers")}
                        <ExternalLink className="h-3 w-3" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
