-- Migration: Onboarding RPCs
-- Adds the seed_industry_data RPC

CREATE OR REPLACE FUNCTION public.seed_industry_data(
  p_business_id uuid,
  p_industry text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_template record;
  v_topic jsonb;
  v_rule jsonb;
  v_inserted_topics jsonb := '[]'::jsonb;
BEGIN
  -- 1. Get the industry template
  SELECT * INTO v_template FROM public.industry_templates WHERE industry = p_industry::public.industry_type;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Industry template not found for %', p_industry;
  END IF;

  -- 2. Clear existing default topics and rules for this business
  DELETE FROM public.competency_topics 
  WHERE business_id = p_business_id AND is_default = true;

  DELETE FROM public.escalation_rules 
  WHERE business_id = p_business_id AND is_default = true;

  -- 3. Insert default topics
  IF v_template.default_topics IS NOT NULL THEN
    FOR v_topic IN SELECT * FROM jsonb_array_elements(v_template.default_topics)
    LOOP
      INSERT INTO public.competency_topics (
        business_id, 
        name, 
        description, 
        is_default
      ) VALUES (
        p_business_id, 
        v_topic->>'name', 
        v_topic->>'description', 
        true
      );
    END LOOP;
  END IF;

  -- 4. Insert default escalation rules
  IF v_template.default_escalation_rules IS NOT NULL THEN
    FOR v_rule IN SELECT * FROM jsonb_array_elements(v_template.default_escalation_rules)
    LOOP
      INSERT INTO public.escalation_rules (
        business_id,
        trigger_type,
        description,
        escalation_level,
        keywords,
        is_default
      ) VALUES (
        p_business_id,
        (v_rule->>'trigger_type')::public.escalation_trigger_type,
        v_rule->>'description',
        (v_rule->>'escalation_level')::public.escalation_level,
        CASE 
          WHEN v_rule->'keywords' IS NOT NULL THEN (SELECT array_agg(x::text) FROM jsonb_array_elements_text(v_rule->'keywords') x)
          ELSE '{}'::text[]
        END,
        true
      );
    END LOOP;
  END IF;

  -- 5. Update business industry
  UPDATE public.businesses 
  SET industry = p_industry::public.industry_type 
  WHERE id = p_business_id;

  -- 6. Update onboarding progress
  UPDATE public.onboarding_progress 
  SET 
    industry_completed = true, 
    current_step = 'knowledge' 
  WHERE business_id = p_business_id;

  -- 7. Build and return the inserted topics
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'name', name,
      'description', description
    )
  ) INTO v_inserted_topics
  FROM public.competency_topics
  WHERE business_id = p_business_id AND is_default = true;

  RETURN COALESCE(v_inserted_topics, '[]'::jsonb);
END;
$$;
