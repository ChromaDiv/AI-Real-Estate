"use client";

import { useState, useCallback } from "react";
import Papa from "papaparse";
import { supabase } from "@/lib/supabase";
import { FileDropzone } from "@/components/FileDropzone";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Upload,
    Check,
    AlertTriangle,
    FileSpreadsheet,
    Loader2,
} from "lucide-react";

interface ParsedRow {
    address: string;
    price: string | number;
    sqft: string | number;
    bedrooms: string | number;
    bathrooms: string | number;
    status: string;
}

export default function UploadPage() {
    const [rows, setRows] = useState<ParsedRow[]>([]);
    const [fileName, setFileName] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(false);

    const handleFile = useCallback((file: File) => {
        setFileName(file.name);
        setUploaded(false);

        Papa.parse<ParsedRow>(file, {
            header: true,
            skipEmptyLines: true,
            complete(results) {
                setRows(results.data);
                toast.success(`Parsed ${results.data.length} rows from ${file.name}`);
            },
            error(err) {
                toast.error(`Failed to parse CSV: ${err.message}`);
            },
        });
    }, []);

    const handleUpload = async () => {
        if (rows.length === 0) return;

        setUploading(true);

        const formatted = rows.map((r) => ({
            address: r.address || "Unknown",
            price: parseFloat(String(r.price)) || 0,
            sqft: parseInt(String(r.sqft)) || null,
            bedrooms: parseInt(String(r.bedrooms)) || null,
            bathrooms: parseInt(String(r.bathrooms)) || null,
            status: r.status || "Available",
        }));

        const { error } = await supabase.from("properties").insert(formatted);

        setUploading(false);

        if (error) {
            toast.error(`Upload failed: ${error.message}`);
        } else {
            toast.success(`${formatted.length} properties uploaded successfully!`);
            setUploaded(true);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                    Upload Properties
                </h1>
                <p className="mt-1 text-sm text-white/50">
                    Import property data from a CSV file
                </p>
            </div>

            {/* Dropzone */}
            <FileDropzone onFileSelected={handleFile} />

            {/* Preview Table */}
            {rows.length > 0 && (
                <div className="glass-card space-y-4 rounded-2xl p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4 text-blue-400" />
                            <h2 className="text-lg font-semibold text-white">Preview</h2>
                            <span className="ml-2 rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white/50 ring-1 ring-white/10">
                                {rows.length} rows
                            </span>
                        </div>

                        <Button
                            onClick={handleUpload}
                            disabled={uploading || uploaded}
                            className="gap-2"
                        >
                            {uploading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : uploaded ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <Upload className="h-4 w-4" />
                            )}
                            {uploading
                                ? "Uploading…"
                                : uploaded
                                    ? "Uploaded!"
                                    : "Upload to Supabase"}
                        </Button>
                    </div>

                    <div className="overflow-x-auto rounded-xl">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-white/[0.06]">
                                    {["Address", "Price", "Sq Ft", "Beds", "Baths", "Status"].map(
                                        (h) => (
                                            <th
                                                key={h}
                                                className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-white/40"
                                            >
                                                {h}
                                            </th>
                                        )
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                                {rows.slice(0, 50).map((row, i) => (
                                    <tr
                                        key={i}
                                        className="transition-colors hover:bg-white/[0.02]"
                                    >
                                        <td className="px-4 py-3 text-white/80">{row.address}</td>
                                        <td className="px-4 py-3 text-emerald-400 font-medium">
                                            ${parseFloat(String(row.price)).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-white/60">{row.sqft}</td>
                                        <td className="px-4 py-3 text-white/60">{row.bedrooms}</td>
                                        <td className="px-4 py-3 text-white/60">{row.bathrooms}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400 ring-1 ring-blue-500/20">
                                                {row.status || "Available"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {rows.length > 50 && (
                            <p className="border-t border-white/[0.04] px-4 py-3 text-center text-xs text-white/30">
                                Showing first 50 of {rows.length} rows
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
