"use client";

import { Sidebar } from "@/components/Sidebar";
import { useRealtimeLeads } from "@/hooks/useRealtimeLeads";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { leads, latestLead, isConnected } = useRealtimeLeads();

    return (
        <>
            <Sidebar isConnected={isConnected} />

            {/* Main content — offset for sidebar on desktop */}
            <main className="min-h-screen lg:pl-72">
                <div className="mx-auto max-w-7xl px-4 py-8 pt-16 sm:px-6 lg:px-8 lg:pt-8">
                    {children}
                </div>
            </main>
        </>
    );
}
