import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ---------- Database row types ---------- */

export type Property = {
  id: string;
  address: string;
  price: number;
  sqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  status: string;
  created_at: string;
};

export type LeadCategory = "HOT" | "WARM" | "SPAM";

export type Lead = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  category: LeadCategory;
  call_summary: string | null;
  tags: string[];
  property_id: string | null;
  created_at: string;
};
