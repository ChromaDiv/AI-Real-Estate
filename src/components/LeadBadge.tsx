import { cn } from "@/lib/utils";
import { LeadCategory } from "@/lib/supabase";

const config: Record<
    LeadCategory,
    { label: string; bg: string; text: string; ring: string; dot: string }
> = {
    HOT: {
        label: "Hot",
        bg: "bg-emerald-500/15",
        text: "text-emerald-400",
        ring: "ring-emerald-500/30",
        dot: "bg-emerald-400",
    },
    WARM: {
        label: "Warm",
        bg: "bg-amber-500/15",
        text: "text-amber-400",
        ring: "ring-amber-500/30",
        dot: "bg-amber-400",
    },
    SPAM: {
        label: "Spam",
        bg: "bg-red-500/15",
        text: "text-red-400",
        ring: "ring-red-500/30",
        dot: "bg-red-400",
    },
};

export function LeadBadge({
    category,
    className,
}: {
    category: LeadCategory;
    className?: string;
}) {
    const c = config[category];
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1",
                c.bg,
                c.text,
                c.ring,
                className
            )}
        >
            <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
            {c.label}
        </span>
    );
}
