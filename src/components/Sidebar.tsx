"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Building2,
    Upload,
    Bot,
    Menu,
    X,
} from "lucide-react";
import { LiveIndicator } from "@/components/LiveIndicator";
import { useState } from "react";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/properties", label: "Properties", icon: Building2 },
    { href: "/upload", label: "Upload CSV", icon: Upload },
    { href: "/agent", label: "Voice Agent", icon: Bot },
];

export function Sidebar({ isConnected }: { isConnected: boolean }) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            {/* Mobile hamburger */}
            <button
                onClick={() => setMobileOpen(true)}
                className="fixed left-4 top-4 z-50 rounded-xl bg-white/5 p-2 ring-1 ring-white/10 backdrop-blur-xl lg:hidden"
                aria-label="Open navigation"
            >
                <Menu className="h-5 w-5 text-white" />
            </button>

            {/* Backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "glass-sidebar fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/[0.06] transition-transform duration-300 lg:translate-x-0",
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Close button (mobile) */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="absolute right-4 top-4 rounded-lg p-1 text-white/40 hover:text-white lg:hidden"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-8">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/25">
                        <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-white">
                            LeadFlow
                        </h1>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                            Intelligence
                        </p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-1 px-3">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-white/10 text-white shadow-lg shadow-white/5"
                                        : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-blue-400 to-cyan-400" />
                                )}
                                <item.icon
                                    className={cn(
                                        "h-[18px] w-[18px] transition-colors",
                                        isActive ? "text-blue-400" : "text-white/40 group-hover:text-white/60"
                                    )}
                                />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Live Status */}
                <div className="border-t border-white/[0.06] p-5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-white/40">
                            Realtime Status
                        </span>
                        <LiveIndicator connected={isConnected} />
                    </div>
                </div>
            </aside>
        </>
    );
}
