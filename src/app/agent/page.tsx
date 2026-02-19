"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getVapi } from "@/lib/vapi";
import { DEFAULT_SYSTEM_PROMPT, buildPrompt } from "@/lib/agent-prompt";
import { supabase, Property } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Bot,
    Phone,
    PhoneOff,
    Mic,
    MicOff,
    Loader2,
    MessageSquare,
    Sparkles,
} from "lucide-react";

type CallStatus = "idle" | "connecting" | "active" | "ended";

export default function AgentPage() {
    const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
    const [callStatus, setCallStatus] = useState<CallStatus>("idle");
    const [transcript, setTranscript] = useState<
        { role: string; text: string }[]
    >([]);
    const [isMuted, setIsMuted] = useState(false);
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    /* Auto-scroll transcript */
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [transcript]);

    /* Load properties into prompt */
    useEffect(() => {
        async function loadProperties() {
            const { data } = await supabase.from("properties").select("*");
            if (data && data.length > 0) {
                const json = JSON.stringify(data, null, 2);
                setSystemPrompt(buildPrompt(json));
            }
        }
        loadProperties();
    }, []);

    /* Vapi Event Listeners */
    useEffect(() => {
        const vapi = getVapi();

        const onCallStart = () => setCallStatus("active");
        const onCallEnd = () => setCallStatus("ended");
        const onMessage = (msg: any) => {
            console.log("Vapi Message:", msg); // Debug logging

            if (msg.type === "transcript") {
                const role = (msg.role as string) || "assistant";
                const text = (msg.transcript as string) || "";
                if (text) {
                    setTranscript((prev) => [...prev, { role, text }]);
                }
            } else if (msg.type === "function-call" && msg.functionCall?.name === "saveLead") {
                handleSaveLead(msg.functionCall.parameters);
            } else if (msg.type === "call-function" && msg.functionCall?.name === "saveLead") {
                handleSaveLead(msg.functionCall.parameters);
            } else if (msg.type === "tool-calls" || msg.type === "tool_calls") {
                const calls = msg.toolCalls || msg.tool_calls || [];
                calls.forEach((toolCall: any) => {
                    if (toolCall.function?.name === "saveLead") {
                        let args = toolCall.function.arguments;
                        if (typeof args === 'string') {
                            try {
                                args = JSON.parse(args);
                            } catch (e) {
                                console.error("Failed to parse tool arguments:", e);
                            }
                        }
                        handleSaveLead(args);
                    }
                });
            }
        };

        const handleSaveLead = async (args: any) => {
            console.log("Saving lead:", args);
            try {
                const { error } = await supabase.from("leads").insert({
                    name: args.name ?? "Unknown",
                    phone: args.phone,
                    email: args.email,
                    category: args.category ?? "WARM",
                    call_summary: args.summary,
                    property_id: args.property_id,
                });

                if (error) throw error;
                toast.success("Lead saved successfully!");
            } catch (err) {
                console.error("Failed to save lead:", err);
                toast.error("Failed to save lead details");
            }
        }

        const onError = (err: any) => {
            console.error("Vapi error:", err);
            setCallStatus("ended");
        };

        vapi.on("call-start", onCallStart);
        vapi.on("call-end", onCallEnd);
        vapi.on("message", onMessage);
        vapi.on("error", onError);

        return () => {
            vapi.off("call-start", onCallStart);
            vapi.off("call-end", onCallEnd);
            vapi.off("message", onMessage);
            vapi.off("error", onError);
        };
    }, []);

    const startCall = useCallback(async () => {
        try {
            setCallStatus("connecting");
            setTranscript([]);

            const vapi = getVapi();
            await vapi.start({
                model: {
                    provider: "openai",
                    model: "gpt-4o-mini",
                    messages: [{ role: "system", content: systemPrompt }],
                    tools: [
                        {
                            type: "function",
                            function: {
                                name: "saveLead",
                                description: "Save lead details to the database when the user provides information.",
                                parameters: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string", description: "The caller's full name" },
                                        phone: { type: "string", description: "The caller's phone number" },
                                        email: { type: "string", description: "The caller's email address" },
                                        category: {
                                            type: "string",
                                            enum: ["HOT", "WARM", "SPAM"],
                                            description: "Lead categorization based on interest",
                                        },
                                        summary: { type: "string", description: "Brief summary of the call" },
                                        property_id: { type: "string", description: "UUID of the property discussed" },
                                    },
                                    required: ["name", "phone", "category"],
                                },
                            },
                        },
                    ],
                },
                transcriber: {
                    provider: "deepgram",
                    model: "nova-2",
                    language: "en",
                },
                voice: {
                    provider: "11labs",
                    voiceId: "sarah",
                },
            });
        } catch (err) {
            console.error("Failed to start call:", err);
            toast.error("Failed to start call. Check your Vapi API key.");
            setCallStatus("idle");
        }
    }, [systemPrompt]);

    const endCall = useCallback(() => {
        try {
            const vapi = getVapi();
            vapi.stop();
            setCallStatus("ended");
        } catch {
            setCallStatus("idle");
        }
    }, []);

    const toggleMute = useCallback(() => {
        try {
            const vapi = getVapi();
            const next = !isMuted;
            vapi.setMuted(next);
            setIsMuted(next);
        } catch { }
    }, [isMuted]);

    const statusConfig: Record<
        CallStatus,
        { label: string; color: string; pulse: boolean }
    > = {
        idle: { label: "Ready", color: "bg-zinc-500", pulse: false },
        connecting: { label: "Connecting…", color: "bg-amber-400", pulse: true },
        active: { label: "Call Active", color: "bg-emerald-400", pulse: true },
        ended: { label: "Call Ended", color: "bg-red-400", pulse: false },
    };

    const s = statusConfig[callStatus];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                    Voice Agent
                </h1>
                <p className="mt-1 text-sm text-white/50">
                    Configure and test the AI call agent
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {/* ─── System Prompt ─── */}
                <div className="glass-card rounded-2xl p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-blue-400" />
                        <h2 className="text-lg font-semibold text-white">System Prompt</h2>
                    </div>
                    <textarea
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        rows={18}
                        className="w-full rounded-xl bg-white/[0.03] p-4 text-sm text-white/80 ring-1 ring-white/[0.06] placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-mono leading-relaxed resize-none"
                        placeholder="Enter your agent instructions…"
                    />
                </div>

                {/* ─── Call Controls & Transcript ─── */}
                <div className="space-y-4">
                    {/* Call Control Card */}
                    <div className="glass-card rounded-2xl p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bot className="h-4 w-4 text-blue-400" />
                                <h2 className="text-lg font-semibold text-white">
                                    Test Call
                                </h2>
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-2 text-xs font-medium text-white/60">
                                <span className="relative flex h-2.5 w-2.5">
                                    {s.pulse && (
                                        <span
                                            className={`absolute inline-flex h-full w-full animate-ping rounded-full ${s.color} opacity-75`}
                                        />
                                    )}
                                    <span
                                        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${s.color}`}
                                    />
                                </span>
                                {s.label}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {callStatus === "idle" || callStatus === "ended" ? (
                                <Button
                                    onClick={startCall}
                                    className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/20"
                                    size="lg"
                                >
                                    <Phone className="h-4 w-4" />
                                    Start Test Call
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        onClick={endCall}
                                        variant="destructive"
                                        className="gap-2"
                                        size="lg"
                                    >
                                        <PhoneOff className="h-4 w-4" />
                                        End Call
                                    </Button>
                                    <Button
                                        onClick={toggleMute}
                                        variant="outline"
                                        className="gap-2"
                                        size="lg"
                                    >
                                        {isMuted ? (
                                            <MicOff className="h-4 w-4" />
                                        ) : (
                                            <Mic className="h-4 w-4" />
                                        )}
                                        {isMuted ? "Unmute" : "Mute"}
                                    </Button>
                                </>
                            )}
                            {callStatus === "connecting" && (
                                <div className="flex items-center gap-2 text-sm text-white/40">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Establishing connection…
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Transcript */}
                    <div className="glass-card rounded-2xl p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-blue-400" />
                            <h2 className="text-lg font-semibold text-white">
                                Live Transcript
                            </h2>
                        </div>

                        <div className="max-h-[350px] space-y-3 overflow-y-auto pr-1">
                            {transcript.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <MessageSquare className="h-8 w-8 text-white/10" />
                                    <p className="mt-3 text-sm text-white/30">
                                        Transcript will appear here during a call
                                    </p>
                                </div>
                            ) : (
                                transcript.map((t, i) => (
                                    <div
                                        key={i}
                                        className={`flex gap-3 ${t.role === "user" ? "justify-end" : "justify-start"
                                            }`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${t.role === "user"
                                                ? "bg-blue-500/20 text-blue-200 ring-1 ring-blue-500/20"
                                                : "bg-white/[0.04] text-white/70 ring-1 ring-white/[0.06]"
                                                }`}
                                        >
                                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider opacity-50">
                                                {t.role === "user" ? "Caller" : "Agent"}
                                            </p>
                                            {t.text}
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={transcriptEndRef} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
