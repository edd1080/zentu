"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

async function fetchBusinessId(): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: biz } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();
  return biz?.id ?? null;
}

/**
 * Shared cached hook for businessId.
 * staleTime: 10 minutes — business ID never changes per session.
 * All pages should use this instead of fetching user+business independently.
 */
export function useBusinessId() {
  return useQuery({
    queryKey: ["business-id"],
    queryFn: fetchBusinessId,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
  });
}
