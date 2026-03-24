"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import type { HistoryItem } from "@/components/dashboard/HistoryCard";

interface TrainTopic { id: string; name: string; knowledge_count: number; }
interface TrainData { businessId: string; items: HistoryItem[]; opportunities: TrainTopic[]; }

async function fetchTrainData(): Promise<TrainData> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { businessId: "", items: [], opportunities: [] };
  const { data: biz } = await supabase.from("businesses").select("id").eq("owner_id", user.id).single();
  if (!biz) return { businessId: "", items: [], opportunities: [] };

  const [{ data: rawItems }, { data: topics }] = await Promise.all([
    supabase.from("knowledge_items")
      .select("id, content, layer, active, created_at, topic:competency_topics(name), source:knowledge_sources(type)")
      .eq("business_id", biz.id).order("created_at", { ascending: false }).limit(5),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from("competency_topics").select("id, name, knowledge_count")
      .eq("business_id", biz.id).eq("knowledge_count", 0).order("name", { ascending: true }),
  ]);

  return {
    businessId: biz.id,
    items: (rawItems || []).map((item: any) => ({
      id: item.id, content: item.content, topic_name: item.topic?.name || "General",
      layer: item.layer, source_type: item.source?.type || "quick_instruct",
      created_at: item.created_at, active: item.active,
    })),
    opportunities: topics || [],
  };
}

export function useTrainData() {
  const supabase = createClient();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["train-data"], queryFn: fetchTrainData, staleTime: 60_000});

  const [toggling, setToggling] = React.useState<string | null>(null);
  const [confirmItem, setConfirmItem] = React.useState<HistoryItem | null>(null);

  const businessId = data?.businessId ?? null;
  const recentItems = data?.items ?? [];
  const opportunities = data?.opportunities ?? [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["train-data"] });
    queryClient.invalidateQueries({ queryKey: ["nav-counts"] });
  };

  const requestToggle = (item: HistoryItem) => {
    item.active ? setConfirmItem(item) : executeToggle(item, true);
  };

  const executeToggle = async (item: HistoryItem, newActive: boolean) => {
    setConfirmItem(null);
    setToggling(item.id);
    try {
      const { error } = await supabase.from("knowledge_items").update({ active: newActive }).eq("id", item.id);
      if (error) throw error;
      if (businessId) {
        await (supabase.rpc as any)("refresh_competency_coverage", { p_business_id: businessId });
        await (supabase as any).from("agent_context_cache").delete().eq("business_id", businessId);
      }
      invalidate();
      toast({ type: newActive ? "success" : "info", message: newActive ? "Instrucción reactivada." : "Instrucción desactivada." });
    } catch (err: any) {
      toast({ type: "error", message: "No se pudo actualizar: " + err.message });
    } finally { setToggling(null); }
  };

  return { businessId, recentItems, opportunities, isLoading, toggling, confirmItem, setConfirmItem, requestToggle, executeToggle, invalidate };
}
