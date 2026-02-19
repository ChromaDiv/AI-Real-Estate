import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Lead, supabase } from "@/lib/supabase";
import { LeadBadge } from "./LeadBadge";
import { Calendar, Mail, Phone, MapPin, MessageSquare, Clock, Activity } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface LeadDetailsDialogProps {
    lead: Lead | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LeadDetailsDialog({
    lead: initialLead,
    open,
    onOpenChange,
}: LeadDetailsDialogProps) {
    const [lead, setLead] = useState<Lead | null>(initialLead);

    // Sync local state when prop changes
    if (initialLead && initialLead.id !== lead?.id) {
        setLead(initialLead);
    }

    if (!lead) return null;

    const STATUS_OPTIONS = ["Called", "On Hold", "Confirmed"];
    const currentStatus = lead.tags?.[0] || "";

    const handleStatusChange = async (value: string) => {
        // optimistically update
        const updatedTags = [value];
        setLead({ ...lead, tags: updatedTags });

        const { error } = await supabase
            .from("leads")
            .update({ tags: updatedTags })
            .eq("id", lead.id);

        if (error) {
            toast.error("Failed to update status");
            // revert if needed, though mostly okay for now
        } else {
            toast.success("Status updated");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] border-white/10 bg-[#0A0A0A] text-white">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <DialogTitle className="text-xl">{lead.name}</DialogTitle>
                        <LeadBadge category={lead.category} />
                    </div>
                    <DialogDescription className="text-white/40">
                        Lead captured on {new Date(lead.created_at).toLocaleDateString()}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
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
                                <span className="text-white/80">{lead.phone || "No phone"}</span>
                            </div>
                            {lead.email && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="h-4 w-4 text-white/30" />
                                    <span className="text-white/80">{lead.email}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Call Summary */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-medium uppercase tracking-wider text-white/50">
                            Call Summary
                        </h4>
                        <div className="flex gap-3 text-sm">
                            <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-white/30" />
                            <p className="leading-relaxed text-white/80">
                                {lead.call_summary || "No summary available."}
                            </p>
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
                        <span>Created at {new Date(lead.created_at).toLocaleString()}</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
