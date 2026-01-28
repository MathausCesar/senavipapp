import { createClient } from "@supabase/supabase-js";

const isDev = process.env.NODE_ENV === "development";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || (isDev ? "http://localhost:54321" : "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (isDev ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" : "");

if (!supabaseUrl || !supabaseAnonKey) {
	// Avoid silent localhost fallbacks in production
	// Surface a clear error so users configure Vercel env vars
	console.error(
		"Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
	);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
