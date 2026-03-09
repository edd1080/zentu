-- Migration: Auth RPC functions
-- Atomic registration + phone verification helpers

-- ============================================================
-- RPC: create_owner_with_business
-- Called after Supabase Auth signup. Creates Owner, Business,
-- Agent, and OnboardingProgress in a single transaction.
-- If any INSERT fails, everything rolls back.
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_owner_with_business(
  p_auth_id uuid,
  p_email text,
  p_full_name text,
  p_phone_personal text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_business_id uuid;
  v_agent_id uuid;
  v_onboarding_id uuid;
BEGIN
  -- 1. Create Owner (id matches auth.users.id)
  INSERT INTO public.owners (id, full_name, email, phone_personal)
  VALUES (p_auth_id, p_full_name, p_email, p_phone_personal);

  -- 2. Create Business (empty shell, filled during onboarding)
  INSERT INTO public.businesses (owner_id, name, industry)
  VALUES (p_auth_id, 'Mi negocio', 'other')
  RETURNING id INTO v_business_id;

  -- 3. Create Agent (inactive until onboarding completes)
  INSERT INTO public.agents (business_id)
  VALUES (v_business_id)
  RETURNING id INTO v_agent_id;

  -- 4. Create OnboardingProgress (starts at industry step)
  INSERT INTO public.onboarding_progress (business_id)
  VALUES (v_business_id)
  RETURNING id INTO v_onboarding_id;

  RETURN jsonb_build_object(
    'owner_id', p_auth_id,
    'business_id', v_business_id,
    'agent_id', v_agent_id,
    'onboarding_id', v_onboarding_id
  );
END;
$$;

-- ============================================================
-- RPC: verify_owner_phone
-- Marks the current authenticated owner's phone as verified.
-- ============================================================

CREATE OR REPLACE FUNCTION public.verify_owner_phone()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.owners
  SET phone_verified = true
  WHERE id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Owner not found for current user';
  END IF;
END;
$$;

-- ============================================================
-- RPC: check_owner_exists
-- Quick check if an owner record exists for the auth user.
-- Used by auth callback to avoid duplicate creation.
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_owner_exists(p_auth_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.owners WHERE id = p_auth_id);
$$;
