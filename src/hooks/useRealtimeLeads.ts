"use client";

import { useEffect, useState } from "react";
import { supabase, Lead } from "@/lib/supabase";

export function useRealtimeLeads() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [latestLead, setLatestLead] = useState<Lead | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    /* Initial fetch */
    useEffect(() => {
        async function fetchLeads() {
            const { data } = await supabase
                .from("leads")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(50);

            if (data) setLeads(data as Lead[]);
        }
        fetchLeads();
    }, []);

    /* Realtime subscription */
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
            .subscribe((status) => {
                setIsConnected(status === "SUBSCRIBED");
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return { leads, latestLead, isConnected };
}
