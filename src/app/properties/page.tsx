"use client";

import { useEffect, useState } from "react";
import { supabase, Property } from "@/lib/supabase";
import { Building2, MapPin, DollarSign, Plus, Loader2, X, Edit, Trash, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const INITIAL_FORM = {
    address: "",
    price: "",
    sqft: "",
    bedrooms: "",
    bathrooms: "",
    status: "Available",
};

export default function PropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(INITIAL_FORM);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);

    async function loadProperties() {
        setLoading(true);
        const { data } = await supabase
            .from("properties")
            .select("*")
            .order("created_at", { ascending: false });
        if (data) setProperties(data as Property[]);
        setLoading(false);
    }

    useEffect(() => {
        loadProperties();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.address.trim() || !form.price) {
            toast.error("Address and Price are required.");
            return;
        }

        setSaving(true);

        const payload = {
            address: form.address.trim(),
            price: parseFloat(form.price) || 0,
            sqft: form.sqft ? parseInt(form.sqft) : null,
            bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
            bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
            status: form.status || "Available",
        };

        let result;
        if (isEditMode && currentId) {
            result = await supabase
                .from("properties")
                .update(payload)
                .eq("id", currentId);
        } else {
            result = await supabase.from("properties").insert([payload]);
        }

        const { error } = result;

        setSaving(false);

        if (error) {
            toast.error(`Failed to add property: ${error.message}`);
        } else {
            toast.success(`Property ${isEditMode ? "updated" : "added"} successfully!`);
            setForm(INITIAL_FORM);
            setOpen(false);
            loadProperties();
        }
    };

    const handleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedIds.size === properties.length) {
            setSelectedIds(new Set());
        } else {
            const allIds = new Set(properties.map((p) => p.id));
            setSelectedIds(allIds);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this property?")) return;

        const { error } = await supabase.from("properties").delete().eq("id", id);
        if (error) {
            toast.error("Failed to delete property");
        } else {
            toast.success("Property deleted");
            loadProperties();
            // Remove from selection if selected
            if (selectedIds.has(id)) {
                const newSelected = new Set(selectedIds);
                newSelected.delete(id);
                setSelectedIds(newSelected);
            }
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} properties?`)) return;

        const idsToDelete = Array.from(selectedIds);
        const { error } = await supabase.from("properties").delete().in("id", idsToDelete);

        if (error) {
            toast.error("Failed to delete properties");
        } else {
            toast.success("Properties deleted");
            setSelectedIds(new Set());
            loadProperties();
        }
    };

    const handleEdit = (property: Property) => {
        setForm({
            address: property.address || "",
            price: property.price?.toString() || "",
            sqft: property.sqft?.toString() || "",
            bedrooms: property.bedrooms?.toString() || "",
            bathrooms: property.bathrooms?.toString() || "",
            status: property.status || "Available",
        });
        setCurrentId(property.id);
        setIsEditMode(true);
        setOpen(true);
    };

    const handleOpenChange = (open: boolean) => {
        setOpen(open);
        if (!open) {
            setIsEditMode(false);
            setCurrentId(null);
            setForm(INITIAL_FORM);
        }
    };

    const statusColor = (s: string) => {
        switch (s.toLowerCase()) {
            case "available":
                return "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30";
            case "sold":
                return "bg-red-500/15 text-red-400 ring-red-500/30";
            case "pending":
                return "bg-amber-500/15 text-amber-400 ring-amber-500/30";
            default:
                return "bg-blue-500/15 text-blue-400 ring-blue-500/30";
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Properties
                    </h1>
                    <p className="mt-1 text-sm text-white/50">
                        All properties in your database
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {selectedIds.size > 0 && (
                        <Button
                            variant="destructive"
                            onClick={handleBulkDelete}
                            className="gap-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20"
                        >
                            <Trash className="h-4 w-4" />
                            Delete ({selectedIds.size})
                        </Button>
                    )}
                    <Button
                        onClick={() => {
                            setForm(INITIAL_FORM);
                            setIsEditMode(false);
                            setOpen(true);
                        }}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Property
                    </Button>
                </div>

                <Dialog open={open} onOpenChange={handleOpenChange}>
                    <DialogContent className="glass-card border-white/10 bg-[#0e0e14]/95 backdrop-blur-xl sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold text-white">
                                {isEditMode ? "Edit Property" : "Add New Property"}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="mt-2 space-y-5">
                            {/* Address */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium uppercase tracking-wider text-white/40">
                                    Address <span className="text-red-400">*</span>
                                </label>
                                <Input
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    placeholder="123 Main St, City, State"
                                    required
                                    className="border-white/10 bg-white/[0.04] text-white placeholder:text-white/25 focus-visible:ring-blue-500/40"
                                />
                            </div>

                            {/* Price */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium uppercase tracking-wider text-white/40">
                                    Price ($) <span className="text-red-400">*</span>
                                </label>
                                <Input
                                    name="price"
                                    type="number"
                                    value={form.price}
                                    onChange={handleChange}
                                    placeholder="450000"
                                    required
                                    min="0"
                                    step="any"
                                    className="border-white/10 bg-white/[0.04] text-white placeholder:text-white/25 focus-visible:ring-blue-500/40"
                                />
                            </div>

                            {/* Sq Ft / Beds / Baths — 3‑column row */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium uppercase tracking-wider text-white/40">
                                        Sq Ft
                                    </label>
                                    <Input
                                        name="sqft"
                                        type="number"
                                        value={form.sqft}
                                        onChange={handleChange}
                                        placeholder="2400"
                                        min="0"
                                        className="border-white/10 bg-white/[0.04] text-white placeholder:text-white/25 focus-visible:ring-blue-500/40"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium uppercase tracking-wider text-white/40">
                                        Beds
                                    </label>
                                    <Input
                                        name="bedrooms"
                                        type="number"
                                        value={form.bedrooms}
                                        onChange={handleChange}
                                        placeholder="3"
                                        min="0"
                                        className="border-white/10 bg-white/[0.04] text-white placeholder:text-white/25 focus-visible:ring-blue-500/40"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium uppercase tracking-wider text-white/40">
                                        Baths
                                    </label>
                                    <Input
                                        name="bathrooms"
                                        type="number"
                                        value={form.bathrooms}
                                        onChange={handleChange}
                                        placeholder="2"
                                        min="0"
                                        className="border-white/10 bg-white/[0.04] text-white placeholder:text-white/25 focus-visible:ring-blue-500/40"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium uppercase tracking-wider text-white/40">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    className="flex h-9 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-1 text-sm text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/40"
                                >
                                    <option value="Available" className="bg-[#0e0e14] text-white">Available</option>
                                    <option value="Pending" className="bg-[#0e0e14] text-white">Pending</option>
                                    <option value="Sold" className="bg-[#0e0e14] text-white">Sold</option>
                                </select>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => handleOpenChange(false)}
                                    className="text-white/50 hover:text-white"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={saving} className="gap-2">
                                    {saving ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Plus className="h-4 w-4" />
                                    )}
                                    {saving ? "Saving…" : isEditMode ? "Save Changes" : "Add Property"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Property List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-blue-400" />
                </div>
            ) : properties.length === 0 ? (
                <div className="glass-card flex flex-col items-center justify-center rounded-2xl py-20 text-center">
                    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                        <Building2 className="h-10 w-10 text-white/20" />
                    </div>
                    <p className="mt-4 text-white/60">No properties yet</p>
                    <p className="mt-1 text-sm text-white/30">
                        Upload a CSV or add one manually to get started
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 px-1">
                        <button
                            onClick={handleSelectAll}
                            className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
                        >
                            {selectedIds.size === properties.length && properties.length > 0 ? (
                                <CheckSquare className="h-4 w-4 text-blue-400" />
                            ) : (
                                <Square className="h-4 w-4" />
                            )}
                            Select All
                        </button>
                        <span className="text-sm text-white/30">
                            • {properties.length} properties
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {properties.map((p) => (
                            <div
                                key={p.id}
                                className={`glass-card group relative rounded-2xl p-5 transition-all duration-300 hover:shadow-2xl ${selectedIds.has(p.id) ? "ring-1 ring-blue-500/50 bg-blue-500/5" : ""
                                    }`}
                            >
                                {/* Actions Overlay */}
                                <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleEdit(p)}
                                        className="h-8 w-8 rounded-full bg-white/10 text-white hover:bg-white/20"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleDelete(p.id)}
                                        className="h-8 w-8 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Header */}
                                <div className="flex items-start justify-between pr-16">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleSelect(p.id)}
                                            className="text-white/30 hover:text-white transition-colors"
                                        >
                                            {selectedIds.has(p.id) ? (
                                                <CheckSquare className="h-5 w-5 text-blue-400" />
                                            ) : (
                                                <Square className="h-5 w-5" />
                                            )}
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-blue-400" />
                                            <h3 className="font-semibold text-white/90 truncate max-w-[150px]">
                                                {p.address}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${statusColor(
                                            p.status
                                        )}`}
                                    >
                                        {p.status}
                                    </span>
                                </div>

                                {/* Price */}
                                <div className="mt-4 flex items-baseline gap-1.5">
                                    <DollarSign className="h-4 w-4 text-emerald-400" />
                                    <span className="text-2xl font-bold text-white">
                                        {Number(p.price).toLocaleString()}
                                    </span>
                                </div>

                                {/* Details */}
                                <div className="mt-4 grid grid-cols-3 gap-3">
                                    {[
                                        { label: "Sq. Ft.", value: p.sqft?.toLocaleString() ?? "—" },
                                        { label: "Beds", value: p.bedrooms ?? "—" },
                                        { label: "Baths", value: p.bathrooms ?? "—" },
                                    ].map((d) => (
                                        <div
                                            key={d.label}
                                            className="rounded-xl bg-white/[0.03] px-3 py-2 text-center ring-1 ring-white/[0.04]"
                                        >
                                            <p className="text-lg font-semibold text-white/80">
                                                {d.value}
                                            </p>
                                            <p className="text-[10px] font-medium uppercase tracking-wider text-white/30">
                                                {d.label}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
