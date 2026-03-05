import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Guard: during build/SSR the URL may be empty — create a dummy client
// Auth will only work at runtime when env vars are set
export const supabase: SupabaseClient = supabaseUrl
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient("https://placeholder.supabase.co", "placeholder-key");

export const isSupabaseConfigured = !!supabaseUrl && supabaseUrl !== "";
