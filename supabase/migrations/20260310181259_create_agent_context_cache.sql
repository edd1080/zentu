CREATE TABLE IF NOT EXISTS public.agent_context_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
    context_string TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.agent_context_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their own business context cache"
    ON public.agent_context_cache FOR SELECT
    USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE owner_id = auth.uid()
        )
    );

-- Allow service role to do everything
CREATE POLICY "Service role can perform all actions on agent_context_cache"
    ON public.agent_context_cache FOR ALL
    USING (true)
    WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agent_context_cache_business_id ON public.agent_context_cache(business_id);
