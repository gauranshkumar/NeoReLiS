"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, Loader2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { paperApi } from "@/lib/api";
import { FileDropZone } from "./file-drop-zone";

interface BibtexImportProps {
    projectId: string;
    onImportStart: () => void;
    onImportComplete: (result: {
        imported: number;
        duplicates: number;
        errors: { row?: number; entry?: string; message: string }[];
        importJobId: string;
    }) => void;
    onError: (error: string) => void;
    isImporting: boolean;
}

export function BibtexImport({
    projectId,
    onImportStart,
    onImportComplete,
    onError,
    isImporting,
}: BibtexImportProps) {
    const t = useTranslations("papers.import");
    const [file, setFile] = useState<File | null>(null);
    const [fileContent, setFileContent] = useState<string>("");
    const [previewStats, setPreviewStats] = useState<{
        entries: number;
        size: string;
    } | null>(null);

    const handleFileSelect = useCallback(async (selectedFile: File) => {
        setFile(selectedFile);

        try {
            const content = await selectedFile.text();
            setFileContent(content);

            // Count BibTeX entries (rough count based on @ symbols)
            const entries = (content.match(/@\w+\s*\{/g) || []).length;
            const sizeKB = (selectedFile.size / 1024).toFixed(1);

            setPreviewStats({
                entries,
                size: `${sizeKB} KB`,
            });
        } catch (err) {
            onError("Failed to read file");
        }
    }, [onError]);

    const handleImport = async () => {
        if (!fileContent) {
            onError("No file content to import");
            return;
        }

        onImportStart();

        const res = await paperApi.import({
            format: "bibtex",
            content: fileContent,
            projectId,
        });

        if (res.error) {
            onError(res.error.message);
        } else if (res.data) {
            onImportComplete(res.data);
        }
    };

    const clearFile = () => {
        setFile(null);
        setFileContent("");
        setPreviewStats(null);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-white mb-2">
                    {t("bibtexTitle")}
                </h3>
                <p className="text-sm text-gray-400">
                    {t("bibtexDescription")}
                </p>
            </div>

            {!file ? (
                <FileDropZone
                    accept=".bib,.bibtex"
                    onFileSelect={handleFileSelect}
                    icon={<FileText className="h-10 w-10 text-gray-500" />}
                    label={t("dropBibtex")}
                    hint={t("bibtexFormats")}
                />
            ) : (
                <div className="space-y-4">
                    {/* File info */}
                    <div className="flex items-center justify-between p-4 bg-[#0d0d0d] rounded-lg border border-[#262626]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-500/10 rounded-lg">
                                <FileText className="h-5 w-5 text-cyan-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">
                                    {file.name}
                                </p>
                                {previewStats && (
                                    <p className="text-xs text-gray-500">
                                        {previewStats.entries} {t("entries")} •{" "}
                                        {previewStats.size}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={clearFile}
                            className="text-sm text-gray-400 hover:text-white"
                        >
                            {t("remove")}
                        </button>
                    </div>

                    {/* Preview area */}
                    {fileContent && (
                        <div className="bg-[#0d0d0d] rounded-lg border border-[#262626] p-4">
                            <h4 className="text-sm font-medium text-gray-400 mb-2">
                                {t("preview")}
                            </h4>
                            <pre className="text-xs text-gray-500 overflow-x-auto max-h-40 overflow-y-auto font-mono">
                                {fileContent.substring(0, 1000)}
                                {fileContent.length > 1000 && "..."}
                            </pre>
                        </div>
                    )}

                    {/* Import button */}
                    <div className="flex items-center gap-3 justify-end">
                        <button
                            onClick={clearFile}
                            className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                            disabled={isImporting}
                        >
                            {t("cancel")}
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={isImporting || !fileContent}
                            className="flex items-center gap-2 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            {isImporting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {t("importing")}
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4" />
                                    {t("importPapers")}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
