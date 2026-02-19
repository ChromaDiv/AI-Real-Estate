"use client";

import { useEffect, useState } from "react";
import { supabase, Lead } from "@/lib/supabase";

export function useRealtimeLeads() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [latestLead, setLatestLead] = useState<Lead | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);

    /* Initial fetch */
    useEffect(() => {
        async function fetchLeads() {
            setLoading(true);
            const { data } = await supabase
                .from("leads")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(50);

            if (data) setLeads(data as Lead[]);
            setLoading(false);
        }
        fetchLeads();
    }, []);

    /* Realtime subscription — INSERT, UPDATE, DELETE */
    useEffect(() => {
        const channel = supabase
            .channel("leads-realtime")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "leads" },
                (payload) => {
                    const newLead = payload.new as Lead;
                    setLatestLead(newLead);
                    setLeads((prev) => [newLead, ...prev]);
                }
            )
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "leads" },
                (payload) => {
                    const updated = payload.new as Lead;
                    setLeads((prev) =>
                        prev.map((l) => (l.id === updated.id ? updated : l))
                    );
                }
            )
            .on(
                "postgres_changes",
                { event: "DELETE", schema: "public", table: "leads" },
                (payload) => {
                    const deletedId = (payload.old as { id: string }).id;
                    setLeads((prev) => prev.filter((l) => l.id !== deletedId));
                }
            )
            .subscribe((status) => {
                setIsConnected(status === "SUBSCRIBED");
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return { leads, latestLead, isConnected, loading };
}
