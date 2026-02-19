import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";

export default async function ProtectedDashboardPage() {
    const supabase = await createServerSupabase();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // For now, redirect to the main dashboard at /
    // In a future iteration, this could be a separate authenticated view
    redirect("/");
}
