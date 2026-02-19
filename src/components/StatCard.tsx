"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    className?: string;
    accentColor?: string;
    loading?: boolean;
}

export function StatCard({
    label,
    value,
    icon: Icon,
    trend,
    className,
    accentColor = "from-blue-500/20 to-cyan-500/20",
    loading = false,
}: StatCardProps) {
    return (
        <div
            className={cn(
                "glass-card group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl",
                className
            )}
        >
            {/* Gradient accent */}
            <div
                className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                    accentColor
                )}
            />

            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-white/60">{label}</p>
                    {loading ? (
                        <Skeleton className="mt-2 h-9 w-20 rounded-lg" />
                    ) : (
                        <p className="mt-2 text-3xl font-bold tracking-tight text-white">
                            {value}
                        </p>
                    )}
                    {trend && (
                        <p className="mt-1 text-xs font-medium text-emerald-400">
                            {trend}
                        </p>
                    )}
                </div>
                <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                    <Icon className="h-5 w-5 text-white/70" />
                </div>
            </div>
        </div>
    );
}

