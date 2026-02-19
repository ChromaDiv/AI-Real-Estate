"use client";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Lead, supabase } from "@/lib/supabase";
import { LeadBadge } from "./LeadBadge";
import {
    Calendar,
    Mail,
    Phone,
    MapPin,
    MessageSquare,
    Clock,
    Activity,
    MessageCircle,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";

interface LeadDetailSheetProps {
    lead: Lead | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LeadDetailSheet({
    lead: initialLead,
    open,
    onOpenChange,
}: LeadDetailSheetProps) {
    const [lead, setLead] = useState<Lead | null>(initialLead);

    // Sync local state when prop changes
    if (initialLead && initialLead.id !== lead?.id) {
        setLead(initialLead);
    }

    if (!lead) return null;

    const STATUS_OPTIONS = ["Called", "On Hold", "Confirmed"];
    const currentStatus = lead.tags?.[0] || "";

    const handleStatusChange = async (value: string) => {
        const updatedTags = [value];
        setLead({ ...lead, tags: updatedTags });

        const { error } = await supabase
            .from("leads")
            .update({ tags: updatedTags })
            .eq("id", lead.id);

        if (error) {
            toast.error("Failed to update status");
        } else {
            toast.success("Status updated");
        }
    };

    const whatsappUrl = lead.phone
        ? `https://wa.me/${lead.phone.replace(/\D/g, "")}`
        : null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="overflow-y-auto">
                <SheetHeader>
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 ring-1 ring-white/10">
                            <span className="text-lg font-bold text-white/80">
                                {lead.name?.charAt(0)?.toUpperCase() ?? "?"}
                            </span>
                        </div>
                        <div>
                            <SheetTitle>{lead.name}</SheetTitle>
                            <SheetDescription>
                                Lead captured on{" "}
                                {new Date(lead.created_at).toLocaleDateString()}
                            </SheetDescription>
                        </div>
                    </div>
                    <div className="mt-2">
                        <LeadBadge category={lead.category} />
                    </div>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Status Section */}
                    <div className="space-y-3">
                        <h4 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/50">
                            <Activity className="h-3 w-3" />
                            Status
                        </h4>
                        <Select
                            value={currentStatus}
                            onValueChange={handleStatusChange}
                        >
                            <SelectTrigger className="w-[180px] border-white/10 bg-white/5 text-white ring-offset-0 focus:ring-blue-500/50">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="border-white/10 bg-[#0A0A0A] text-white">
                                {STATUS_OPTIONS.map((status) => (
                                    <SelectItem
                                        key={status}
                                        value={status}
                                        className="focus:bg-white/10 focus:text-white"
                                    >
                                        {status}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-medium uppercase tracking-wider text-white/50">
                            Contact Details
                        </h4>
                        <div className="grid gap-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="h-4 w-4 text-white/30" />
                                <span className="text-white/80">
                                    {lead.phone || "No phone"}
                                </span>
                            </div>
                            {lead.email && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="h-4 w-4 text-white/30" />
                                    <span className="text-white/80">
                                        {lead.email}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    {whatsappUrl && lead.category === "HOT" && (
                        <div className="space-y-3">
                            <h4 className="text-xs font-medium uppercase tracking-wider text-white/50">
                                Quick Actions
                            </h4>
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-400 ring-1 ring-emerald-500/20 transition-all hover:bg-emerald-500/20"
                            >
                                <MessageCircle className="h-4 w-4" />
                                WhatsApp
                            </a>
                        </div>
                    )}

                    {/* Call Summary */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-medium uppercase tracking-wider text-white/50">
                            Call Transcript / Summary
                        </h4>
                        <div className="rounded-xl bg-white/[0.03] p-4 ring-1 ring-white/[0.06]">
                            <div className="flex gap-3 text-sm">
                                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-white/30" />
                                <p className="leading-relaxed text-white/80 whitespace-pre-wrap">
                                    {lead.call_summary ||
                                        "No summary available."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Property Interest */}
                    {lead.property_id && (
                        <div className="space-y-3">
                            <h4 className="text-xs font-medium uppercase tracking-wider text-white/50">
                                Property Interest
                            </h4>
                            <div className="flex items-center gap-3 text-sm">
                                <MapPin className="h-4 w-4 text-white/30" />
                                <span className="font-mono text-xs text-white/80">
                                    ID: {lead.property_id}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Timestamp */}
                    <div className="flex items-center gap-2 border-t border-white/5 pt-4 text-xs text-white/20">
                        <Clock className="h-3 w-3" />
                        <span>
                            Created at{" "}
                            {new Date(lead.created_at).toLocaleString()}
                        </span>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
