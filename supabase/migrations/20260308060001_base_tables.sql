-- Migration 001: Base tables (owners, businesses, agents)
-- Enums, tables, helper function, RLS policies, indexes

-- ============================================================
-- TRIGGER FUNCTIONS (shared across migrations)
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.set_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE public.industry_type AS ENUM (
  'restaurant', 'clinic', 'salon', 'retail',
  'gym', 'professional_services', 'other'
);

CREATE TYPE public.whatsapp_status AS ENUM (
  'disconnected', 'connecting', 'connected', 'expired', 'error'
);

CREATE TYPE public.agent_status AS ENUM (
  'inactive', 'sandbox', 'active', 'paused', 'error'
);

CREATE TYPE public.agent_mode AS ENUM (
  'collaborator', 'autonomous_partial', 'autonomous_full'
);

CREATE TYPE public.agent_tone AS ENUM (
  'friendly', 'professional', 'formal'
);

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE public.owners (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone_personal text,
  phone_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_active_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL UNIQUE REFERENCES public.owners(id) ON DELETE CASCADE,
  name text NOT NULL,
  industry public.industry_type NOT NULL,
  description text CHECK (char_length(description) <= 120),
  address text,
  phone_business text,
  whatsapp_status public.whatsapp_status NOT NULL DEFAULT 'disconnected',
  whatsapp_phone_number_id text,
  whatsapp_waba_id text,
  whatsapp_access_token text,
  whatsapp_token_expires_at timestamptz,
  timezone text NOT NULL DEFAULT 'America/Guatemala',
  schedule jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  activated_at timestamptz
);

COMMENT ON COLUMN public.businesses.whatsapp_access_token
  IS 'Encrypted at application level — never expose in client';

CREATE TABLE public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
  status public.agent_status NOT NULL DEFAULT 'inactive',
  mode public.agent_mode NOT NULL DEFAULT 'collaborator',
  tone public.agent_tone NOT NULL DEFAULT 'friendly',
  activation_date timestamptz,
  total_conversations_handled integer NOT NULL DEFAULT 0,
  total_suggestions_generated integer NOT NULL DEFAULT 0,
  total_suggestions_approved integer NOT NULL DEFAULT 0,
  total_escalations integer NOT NULL DEFAULT 0
);

-- ============================================================
-- HELPER FUNCTION: get current user's business_id
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_business_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM public.businesses WHERE owner_id = auth.uid() LIMIT 1
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Owners: only own record
CREATE POLICY "owners_select_own" ON public.owners
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "owners_insert_own" ON public.owners
  FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "owners_update_own" ON public.owners
  FOR UPDATE USING (id = auth.uid());

-- Businesses: only own business
CREATE POLICY "businesses_select_own" ON public.businesses
  FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "businesses_insert_own" ON public.businesses
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "businesses_update_own" ON public.businesses
  FOR UPDATE USING (owner_id = auth.uid());

-- Agents: through business ownership
CREATE POLICY "agents_select_own" ON public.agents
  FOR SELECT USING (business_id = public.get_business_id());
CREATE POLICY "agents_insert_own" ON public.agents
  FOR INSERT WITH CHECK (business_id = public.get_business_id());
CREATE POLICY "agents_update_own" ON public.agents
  FOR UPDATE USING (business_id = public.get_business_id());

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_businesses_owner_id ON public.businesses(owner_id);
CREATE INDEX idx_agents_business_id ON public.agents(business_id);
CREATE INDEX idx_owners_email ON public.owners(email);
