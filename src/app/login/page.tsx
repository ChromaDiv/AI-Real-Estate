"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setLoading(false);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Logged in successfully!");
            router.push("/dashboard");
        }
    };

    const handleSignUp = async () => {
        if (!email || !password) {
            toast.error("Please enter email and password");
            return;
        }
        setLoading(true);

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        setLoading(false);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Check your email for a confirmation link!");
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center">
            <div className="glass-card w-full max-w-md rounded-2xl p-8">
                {/* Logo */}
                <div className="mb-8 flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/25">
                        <Building2 className="h-7 w-7 text-white" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white">
                            LeadFlow Intelligence
                        </h1>
                        <p className="mt-1 text-sm text-white/40">
                            Sign in to access your dashboard
                        </p>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium uppercase tracking-wider text-white/40">
                            Email
                        </label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="border-white/10 bg-white/[0.04] text-white placeholder:text-white/25 focus-visible:ring-blue-500/40"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium uppercase tracking-wider text-white/40">
                            Password
                        </label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            className="border-white/10 bg-white/[0.04] text-white placeholder:text-white/25 focus-visible:ring-blue-500/40"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/20"
                        size="lg"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Sign In
                    </Button>
                </form>

                <div className="mt-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-xs text-white/30">or</span>
                    <div className="h-px flex-1 bg-white/10" />
                </div>

                <Button
                    onClick={handleSignUp}
                    variant="ghost"
                    disabled={loading}
                    className="mt-4 w-full text-white/50 hover:text-white"
                >
                    Create an account
                </Button>
            </div>
        </div>
    );
}
