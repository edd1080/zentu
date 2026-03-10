-- Create ENUMs
CREATE TYPE public.webhook_status AS ENUM ('pending', 'processing', 'completed', 'error');
CREATE TYPE public.log_outcome AS ENUM ('success', 'error', 'timeout', 'fallback');
CREATE TYPE public.log_actor AS ENUM ('owner', 'system', 'client', 'meta_webhook');

-- Create webhook_queue table
CREATE TABLE public.webhook_queue (
    id uuid default gen_random_uuid() primary key,
    payload jsonb not null,
    status webhook_status not null default 'pending',
    error_message text,
    attempts integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Enable RLS for webhook_queue
ALTER TABLE public.webhook_queue ENABLE ROW LEVEL SECURITY;
-- Internal processing table, no public access needed beyond service role
CREATE POLICY "Service role can manage webhook_queue" ON public.webhook_queue FOR ALL USING (true);


-- Create system_logs table
CREATE TABLE public.system_logs (
    id uuid default gen_random_uuid() primary key,
    trace_id uuid not null,
    event_type text not null,
    business_id uuid references public.businesses(id) on delete cascade,
    conversation_id uuid references public.conversations(id) on delete set null,
    message_id uuid references public.messages(id) on delete set null,
    suggestion_id uuid references public.suggestions(id) on delete set null,
    escalation_id uuid references public.escalations(id) on delete set null,
    actor log_actor not null default 'system',
    llm_provider text,
    llm_model text,
    llm_tokens_input integer,
    llm_tokens_output integer,
    llm_latency_ms integer,
    outcome log_outcome not null default 'success',
    error_type text,
    error_message text,
    metadata jsonb,
    created_at timestamptz not null default now()
);

-- Enable RLS for system_logs
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can view logs for their businesses" 
    ON public.system_logs FOR SELECT 
    USING (
        business_id IN (
            SELECT b.id FROM public.businesses b
            WHERE b.owner_id = auth.uid()
        )
    );

-- Add indexes
CREATE INDEX idx_webhook_queue_status ON public.webhook_queue(status) WHERE status = 'pending';
CREATE INDEX idx_system_logs_trace_id ON public.system_logs(trace_id);
CREATE INDEX idx_system_logs_business_id ON public.system_logs(business_id);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at DESC);

-- Add UNIQUE constraint to messages.whatsapp_message_id for deduplication
ALTER TABLE public.messages ADD CONSTRAINT messages_whatsapp_message_id_key UNIQUE (whatsapp_message_id);
