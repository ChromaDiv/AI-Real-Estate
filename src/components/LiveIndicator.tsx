import { cn } from "@/lib/utils";

export function LiveIndicator({
    connected,
    className,
}: {
    connected: boolean;
    className?: string;
}) {
    return (
        <span className={cn("inline-flex items-center gap-2 text-xs", className)}>
            <span className="relative flex h-2.5 w-2.5">
                {connected && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                    className={cn(
                        "relative inline-flex h-2.5 w-2.5 rounded-full",
                        connected ? "bg-emerald-400" : "bg-zinc-500"
                    )}
                />
            </span>
            <span className={connected ? "text-emerald-400" : "text-zinc-500"}>
                {connected ? "Live" : "Offline"}
            </span>
        </span>
    );
}
