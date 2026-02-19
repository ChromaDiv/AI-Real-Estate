"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";

interface FileDropzoneProps {
    onFileSelected: (file: File) => void;
    accept?: string;
    className?: string;
}

export function FileDropzone({
    onFileSelected,
    accept = ".csv",
    className,
}: FileDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) onFileSelected(file);
        },
        [onFileSelected]
    );

    const handleClick = useCallback(() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = accept;
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) onFileSelected(file);
        };
        input.click();
    }, [accept, onFileSelected]);

    return (
        <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                "glass-card group flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 transition-all duration-300",
                isDragging
                    ? "border-blue-400 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                    : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]",
                className
            )}
        >
            <div
                className={cn(
                    "rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 transition-all duration-300 group-hover:bg-white/10",
                    isDragging && "bg-blue-500/10 ring-blue-400/30"
                )}
            >
                <Upload
                    className={cn(
                        "h-8 w-8 transition-colors",
                        isDragging ? "text-blue-400" : "text-white/50 group-hover:text-white/70"
                    )}
                />
            </div>
            <div className="text-center">
                <p className="text-sm font-medium text-white/80">
                    {isDragging ? "Drop your CSV file here" : "Click or drag a CSV file to upload"}
                </p>
                <p className="mt-1 text-xs text-white/40">
                    Supports .csv files with columns: address, price, sqft, bedrooms, bathrooms, status
                </p>
            </div>
        </div>
    );
}
