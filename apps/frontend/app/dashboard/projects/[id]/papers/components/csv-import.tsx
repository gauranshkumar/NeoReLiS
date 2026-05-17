"use client";

import { useState, useCallback } from "react";
import { Upload, Table, Loader2, Download, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { paperApi } from "@/lib/api";
import { FileDropZone } from "./file-drop-zone";

interface CSVImportProps {
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

interface ColumnMapping {
    title: number;
    authors?: number;
    year?: number;
    doi?: number;
    abstract?: number;
    bibtexKey?: number;
    url?: number;
    keywords?: number;
    venue?: number;
}

const PAPER_FIELDS = [
    { key: "title", label: "Title", required: true },
    { key: "authors", label: "Authors", required: false },
    { key: "year", label: "Year", required: false },
    { key: "doi", label: "DOI", required: false },
    { key: "abstract", label: "Abstract", required: false },
    { key: "bibtexKey", label: "BibTeX Key", required: false },
    { key: "url", label: "URL", required: false },
    { key: "keywords", label: "Keywords", required: false },
    { key: "venue", label: "Venue/Journal", required: false },
] as const;

export function CSVImport({
    projectId,
    onImportStart,
    onImportComplete,
    onError,
    isImporting,
}: CSVImportProps) {
    const t = useTranslations("papers.import");
    const [file, setFile] = useState<File | null>(null);
    const [fileContent, setFileContent] = useState<string>("");
    const [previewData, setPreviewData] = useState<{
        headers: string[];
        rows: string[][];
    } | null>(null);
    const [columnMapping, setColumnMapping] = useState<ColumnMapping>({ title: -1 });
    const [startRow, setStartRow] = useState(1);
    const [step, setStep] = useState<"upload" | "mapping">("upload");

    const handleFileSelect = useCallback(async (selectedFile: File) => {
        setFile(selectedFile);

        try {
            const content = await selectedFile.text();
            setFileContent(content);

            // Parse CSV preview
            const res = await paperApi.previewCSV(content, 10);
            if (res.data) {
                setPreviewData(res.data);

                // Try to auto-detect column mappings from header row
                const firstRow = res.data.rows[0] || [];
                const autoMapping: Partial<ColumnMapping> = { title: -1 };

                firstRow.forEach((cell, index) => {
                    const cellLower = cell.toLowerCase().trim();
                    if (cellLower.includes("title")) autoMapping.title = index;
                    if (cellLower.includes("author")) autoMapping.authors = index;
                    if (cellLower.includes("year")) autoMapping.year = index;
                    if (cellLower.includes("doi")) autoMapping.doi = index;
                    if (cellLower.includes("abstract")) autoMapping.abstract = index;
                    if (cellLower.includes("key") || cellLower.includes("bibtex"))
                        autoMapping.bibtexKey = index;
                    if (cellLower.includes("url") || cellLower.includes("link"))
                        autoMapping.url = index;
                    if (cellLower.includes("keyword")) autoMapping.keywords = index;
                    if (
                        cellLower.includes("venue") ||
                        cellLower.includes("journal") ||
                        cellLower.includes("booktitle")
                    )
                        autoMapping.venue = index;
                });

                setColumnMapping(autoMapping as ColumnMapping);
                setStep("mapping");
            }
        } catch (err) {
            onError("Failed to parse CSV file");
        }
    }, [onError]);

    const handleImport = async () => {
        if (columnMapping.title < 0) {
            onError("Please map the Title column");
            return;
        }

        if (!fileContent) {
            onError("No file content to import");
            return;
        }

        onImportStart();

        // Clean up mapping - remove -1 values
        const cleanMapping: ColumnMapping = { title: columnMapping.title };
        const keys: (keyof ColumnMapping)[] = ['authors', 'year', 'doi', 'abstract', 'bibtexKey', 'url', 'keywords', 'venue'];
        for (const key of keys) {
            const value = columnMapping[key];
            if (value !== undefined && value >= 0) {
                cleanMapping[key] = value;
            }
        }

        const res = await paperApi.import({
            format: "csv",
            content: fileContent,
            projectId,
            columnMapping: cleanMapping,
            startRow,
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
        setPreviewData(null);
        setColumnMapping({ title: -1 });
        setStartRow(1);
        setStep("upload");
    };

    const downloadTemplate = async () => {
        const res = await paperApi.getCSVTemplate();
        if (res.data?.template) {
            const blob = new Blob([res.data.template], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "paper_import_template.csv";
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const getColumnOptions = () => {
        if (!previewData) return [];
        return previewData.rows[0]?.map((_, i) => ({
            value: i,
            label: `Column ${i + 1}${
                previewData.rows[0][i] ? `: ${previewData.rows[0][i].substring(0, 20)}` : ""
            }`,
        })) || [];
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-white mb-2">
                        {t("csvTitle")}
                    </h3>
                    <p className="text-sm text-gray-400">
                        {t("csvDescription")}
                    </p>
                </div>
                <button
                    onClick={downloadTemplate}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 rounded-lg hover:border-cyan-500/50 transition-colors"
                >
                    <Download className="h-4 w-4" />
                    {t("downloadTemplate")}
                </button>
            </div>

            {step === "upload" && (
                <FileDropZone
                    accept=".csv"
                    onFileSelect={handleFileSelect}
                    icon={<Table className="h-10 w-10 text-gray-500" />}
                    label={t("dropCSV")}
                    hint={t("csvFormats")}
                />
            )}

            {step === "mapping" && previewData && (
                <div className="space-y-6">
                    {/* File info */}
                    <div className="flex items-center justify-between p-4 bg-[#0d0d0d] rounded-lg border border-[#262626]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <Table className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">
                                    {file?.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {previewData.rows.length} rows • {previewData.rows[0]?.length || 0} columns
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={clearFile}
                            className="text-sm text-gray-400 hover:text-white"
                        >
                            {t("changeFile")}
                        </button>
                    </div>

                    {/* Column mapping */}
                    <div className="bg-[#0d0d0d] rounded-lg border border-[#262626] p-4">
                        <h4 className="text-sm font-medium text-white mb-4">
                            {t("mapColumns")}
                        </h4>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {PAPER_FIELDS.map((field) => (
                                <div key={field.key}>
                                    <label className="block text-xs text-gray-400 mb-1">
                                        {field.label}
                                        {field.required && (
                                            <span className="text-red-400 ml-1">*</span>
                                        )}
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={
                                                columnMapping[field.key as keyof ColumnMapping] ?? -1
                                            }
                                            onChange={(e) =>
                                                setColumnMapping((prev) => ({
                                                    ...prev,
                                                    [field.key]: parseInt(e.target.value),
                                                }))
                                            }
                                            className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-cyan-500"
                                        >
                                            <option value={-1}>
                                                {t("selectColumn")}
                                            </option>
                                            {getColumnOptions().map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Start row selector */}
                        <div className="mt-4 pt-4 border-t border-[#262626]">
                            <label className="block text-xs text-gray-400 mb-1">
                                {t("startFromRow")}
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min={0}
                                    max={previewData.rows.length}
                                    value={startRow}
                                    onChange={(e) =>
                                        setStartRow(Math.max(0, parseInt(e.target.value) || 0))
                                    }
                                    className="w-20 px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                                />
                                <span className="text-xs text-gray-500">
                                    {t("skipHeaderHint")}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Preview table */}
                    <div className="bg-[#0d0d0d] rounded-lg border border-[#262626] overflow-hidden">
                        <div className="p-4 border-b border-[#262626]">
                            <h4 className="text-sm font-medium text-white">
                                {t("dataPreview")}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                                {t("previewHint")}
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-[#1a1a1a]">
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 border-b border-[#262626]">
                                            #
                                        </th>
                                        {previewData.rows[0]?.map((_, colIndex) => (
                                            <th
                                                key={colIndex}
                                                className={`px-4 py-2 text-left text-xs font-medium border-b border-[#262626] ${
                                                    Object.values(columnMapping).includes(colIndex)
                                                        ? "text-cyan-400 bg-cyan-500/5"
                                                        : "text-gray-400"
                                                }`}
                                            >
                                                Col {colIndex + 1}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.rows.slice(0, 6).map((row, rowIndex) => (
                                        <tr
                                            key={rowIndex}
                                            className={`border-b border-[#1a1a1a] ${
                                                rowIndex < startRow
                                                    ? "opacity-40"
                                                    : ""
                                            }`}
                                        >
                                            <td className="px-4 py-2 text-gray-500 text-xs">
                                                {rowIndex + 1}
                                                {rowIndex < startRow && (
                                                    <span className="ml-1 text-yellow-500">
                                                        (skip)
                                                    </span>
                                                )}
                                            </td>
                                            {row.map((cell, colIndex) => (
                                                <td
                                                    key={colIndex}
                                                    className={`px-4 py-2 text-sm max-w-[200px] truncate ${
                                                        Object.values(columnMapping).includes(
                                                            colIndex
                                                        )
                                                            ? "text-white bg-cyan-500/5"
                                                            : "text-gray-400"
                                                    }`}
                                                    title={cell}
                                                >
                                                    {cell || (
                                                        <span className="text-gray-600 italic">
                                                            empty
                                                        </span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {previewData.rows.length > 6 && (
                            <div className="px-4 py-2 text-xs text-gray-500 bg-[#1a1a1a]">
                                {t("andMoreRows", {
                                    count: previewData.rows.length - 6,
                                })}
                            </div>
                        )}
                    </div>

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
                            disabled={isImporting || columnMapping.title < 0}
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
