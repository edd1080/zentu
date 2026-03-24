"use client";

import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface NavCounts { conversations: number; agent: number; }

const NavCountsContext = createContext<NavCounts>({ conversations: 0, agent: 0 });

async function fetchNavCounts(): Promise<NavCounts> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { conversations: 0, agent: 0 };

  const { data: biz } = await supabase
    .from("businesses").select("id").eq("owner_id", user.id).single();
  if (!biz) return { conversations: 0, agent: 0 };

  const [{ count: convCount }, { count: agentCount }] = await Promise.all([
    supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("business_id", biz.id)
      .eq("status", "pending_approval"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("competency_topics")
      .select("id", { count: "exact", head: true })
      .eq("business_id", biz.id)
      .eq("knowledge_count", 0),
  ]);

  return { conversations: convCount ?? 0, agent: agentCount ?? 0 };
}

export function NavCountsProvider({ children }: { children: React.ReactNode }) {
  const { data: counts = { conversations: 0, agent: 0 } } = useQuery({
    queryKey: ["nav-counts"],
    queryFn: fetchNavCounts,
    staleTime: 120_000,
  });

  return (
    <NavCountsContext.Provider value={counts}>
      {children}
    </NavCountsContext.Provider>
  );
}

export const useNavCounts = () => useContext(NavCountsContext);
