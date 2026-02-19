"use client";

import { useEffect, useState } from "react";
import { supabase, Lead, Property } from "@/lib/supabase";
import { useRealtimeLeads } from "@/hooks/useRealtimeLeads";
import { StatCard } from "@/components/StatCard";
import { LeadBadge } from "@/components/LeadBadge";
import { LiveIndicator } from "@/components/LiveIndicator";
import { LeadDetailsDialog } from "@/components/LeadDetailsDialog";
import {
  Users,
  Flame,
  Sun,
  Building2,
  Phone,
  Clock,
} from "lucide-react";

export default function DashboardPage() {
  const { leads, latestLead, isConnected } = useRealtimeLeads();
  const [counts, setCounts] = useState({
    properties: 0,
    hot: 0,
    warm: 0,
    spam: 0,
    total: 0,
  });
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    async function fetchCounts() {
      // Properties
      const { count: properties } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true });

      // Leads Breakdown
      const { count: hot } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("category", "HOT");

      const { count: warm } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("category", "WARM");

      const { count: spam } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("category", "SPAM");

      const { count: total } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true });

      setCounts({
        properties: properties ?? 0,
        hot: hot ?? 0,
        warm: warm ?? 0,
        spam: spam ?? 0,
        total: total ?? 0,
      });
    }
    fetchCounts();
  }, [leads]); // Re-fetch when new leads come in via realtime

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Real-time lead intelligence overview
          </p>
        </div>
        <LiveIndicator connected={isConnected} />
      </div>

      {/* ─── Stat Cards (Bento Row) ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Leads"
          value={counts.total}
          icon={Users}
          trend="+12% this week"
          accentColor="from-blue-500/20 to-indigo-500/20"
        />
        <StatCard
          label="Hot Leads"
          value={counts.hot}
          icon={Flame}
          accentColor="from-emerald-500/20 to-green-500/20"
        />
        <StatCard
          label="Warm Leads"
          value={counts.warm}
          icon={Sun}
          accentColor="from-amber-500/20 to-orange-500/20"
        />
        <StatCard
          label="Properties"
          value={counts.properties}
          icon={Building2}
          accentColor="from-purple-500/20 to-pink-500/20"
        />
      </div>

      {/* ─── Bento Grid: Main Content ─── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent Calls — spans 2 cols */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Calls</h2>
            <Phone className="h-4 w-4 text-white/30" />
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {leads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <Phone className="h-8 w-8 text-white/20" />
                </div>
                <p className="mt-4 text-sm text-white/40">
                  No calls yet. Start the voice agent to receive leads.
                </p>
              </div>
            ) : (
              leads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="group flex cursor-pointer items-center gap-4 rounded-xl bg-white/[0.02] p-4 ring-1 ring-white/[0.04] transition-all hover:bg-white/[0.04] hover:ring-white/[0.08]"
                >
                  {/* Avatar circle */}
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 ring-1 ring-white/10">
                    <span className="text-sm font-bold text-white/80">
                      {lead.name?.charAt(0)?.toUpperCase() ?? "?"}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white/90 truncate">
                        {lead.name}
                      </span>
                      <LeadBadge category={lead.category} />
                    </div>
                    <p className="mt-0.5 text-xs text-white/40 truncate">
                      {lead.call_summary ?? "No summary available"}
                    </p>
                  </div>

                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <span className="text-xs text-white/30">
                      {lead.phone ?? "—"}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-white/20">
                      <Clock className="h-3 w-3" />
                      {new Date(lead.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Feed — 1 col */}
        <div className="glass-card rounded-2xl p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Live Feed</h2>
            <LiveIndicator connected={isConnected} />
          </div>

          {latestLead ? (
            <div className="glow-pulse mb-4 rounded-xl bg-emerald-500/5 p-4 ring-1 ring-emerald-500/20">
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-400/70">
                Latest Lead
              </p>
              <p className="mt-2 text-lg font-bold text-white">
                {latestLead.name}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <LeadBadge category={latestLead.category} />
                <span className="text-xs text-white/30">
                  {new Date(latestLead.created_at).toLocaleTimeString()}
                </span>
              </div>
              {latestLead.call_summary && (
                <p className="mt-3 text-sm text-white/50">
                  {latestLead.call_summary}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-white/5" />
                <div className="relative rounded-full bg-white/5 p-4 ring-1 ring-white/10">
                  <Users className="h-6 w-6 text-white/20" />
                </div>
              </div>
              <p className="mt-4 text-sm text-white/40">
                Waiting for new leads…
              </p>
            </div>
          )}

          {/* Category Breakdown */}
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-medium text-white/50">
              Lead Categories
            </h3>
            <div className="space-y-3">
              {[
                { label: "Hot", count: counts.hot, color: "bg-emerald-400", total: counts.total },
                { label: "Warm", count: counts.warm, color: "bg-amber-400", total: counts.total },
                { label: "Spam", count: counts.spam, color: "bg-red-400", total: counts.total },
              ].map((cat) => (
                <div key={cat.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-white/60">{cat.label}</span>
                    <span className="text-white/40">{cat.count}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full ${cat.color} transition-all duration-700`}
                      style={{
                        width: `${cat.total > 0 ? (cat.count / cat.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <LeadDetailsDialog
        lead={selectedLead}
        open={!!selectedLead}
        onOpenChange={(open) => !open && setSelectedLead(null)}
      />
    </div>
  );
}
