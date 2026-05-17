"use client";

import { useState, useCallback, useRef, ReactNode } from "react";
import { Upload } from "lucide-react";
import { useTranslations } from "next-intl";

interface FileDropZoneProps {
    accept: string;
    onFileSelect: (file: File) => void;
    icon?: ReactNode;
    label?: string;
    hint?: string;
    disabled?: boolean;
}

export function FileDropZone({
    accept,
    onFileSelect,
    icon,
    label,
    hint,
    disabled = false,
}: FileDropZoneProps) {
    const t = useTranslations("papers.import");
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragging(true);
        }
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            if (disabled) return;

            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                onFileSelect(files[0]);
            }
        },
        [disabled, onFileSelect]
    );

    const handleClick = () => {
        if (!disabled && inputRef.current) {
            inputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onFileSelect(files[0]);
        }
        // Reset input so the same file can be selected again
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            className={`
                relative flex flex-col items-center justify-center gap-4 p-12
                border-2 border-dashed rounded-xl cursor-pointer
                transition-all duration-200
                ${isDragging
                    ? "border-cyan-500 bg-cyan-500/5"
                    : "border-[#333] hover:border-[#444] bg-[#0d0d0d]"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled}
            />

            {icon || <Upload className="h-10 w-10 text-gray-500" />}

            <div className="text-center">
                <p className="text-sm text-gray-300">
                    {label || t("dragAndDrop")}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    {t("or")}{" "}
                    <span className="text-cyan-400 hover:text-cyan-300">
                        {t("browseFiles")}
                    </span>
                </p>
            </div>

            {hint && (
                <p className="text-xs text-gray-600">{hint}</p>
            )}
        </div>
    );
}
