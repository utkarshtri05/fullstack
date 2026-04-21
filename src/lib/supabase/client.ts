"use client";

import { createBrowserClient } from "@supabase/ssr";
import { requiredEnv } from "@/lib/env";

export function createSupabaseBrowserClient() {
  const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createBrowserClient(url, anonKey);
}

