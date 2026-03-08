-- Migration 002: Knowledge tables
-- industry_templates, knowledge_sources, knowledge_items,
-- competency_topics, autonomy_rules, escalation_rules

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE public.knowledge_source_type AS ENUM (
  'onboarding', 'quick_instruct', 'voice_note',
  'image_ocr', 'link_extraction', 'correction'
);

CREATE TYPE public.knowledge_layer AS ENUM (
  'structured', 'operational', 'narrative', 'learned'
);

CREATE TYPE public.knowledge_validity AS ENUM (
  'permanent', 'temporary', 'one_time'
);

CREATE TYPE public.competency_status AS ENUM (
  'strong', 'partial', 'weak'
);

CREATE TYPE public.autonomy_level AS ENUM (
  'collaborator', 'autonomous_with_guardrails'
);

CREATE TYPE public.autonomy_activated_by AS ENUM (
  'owner_manual', 'system_suggestion_accepted'
);

CREATE TYPE public.escalation_trigger_type AS ENUM (
  'missing_info', 'sensitive_topic', 'keyword_match', 'emergency_keyword'
);

CREATE TYPE public.escalation_level AS ENUM (
  'informative', 'sensitive', 'urgent'
);

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE public.industry_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry public.industry_type NOT NULL UNIQUE,
  name text NOT NULL,
  default_topics jsonb NOT NULL DEFAULT '[]'::jsonb,
  default_escalation_rules jsonb NOT NULL DEFAULT '[]'::jsonb,
  sample_questions jsonb NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE public.knowledge_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  type public.knowledge_source_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  raw_content text,
  processed_by text
);

CREATE TABLE public.knowledge_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  source_id uuid REFERENCES public.knowledge_sources(id) ON DELETE SET NULL,
  topic_id uuid, -- FK added after competency_topics creation
  layer public.knowledge_layer NOT NULL,
  content text NOT NULL,
  validity public.knowledge_validity NOT NULL DEFAULT 'permanent',
  valid_until timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  confirmed_by_owner boolean NOT NULL DEFAULT false
);

CREATE TRIGGER set_knowledge_items_updated_at
  BEFORE UPDATE ON public.knowledge_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.competency_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  status public.competency_status NOT NULL DEFAULT 'weak',
  coverage_percentage integer NOT NULL DEFAULT 0 CHECK (coverage_percentage BETWEEN 0 AND 100),
  approval_rate_7d decimal NOT NULL DEFAULT 0,
  escalation_rate_7d decimal NOT NULL DEFAULT 0,
  incident_count_7d integer NOT NULL DEFAULT 0,
  last_updated timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_competency_topics_last_updated
  BEFORE UPDATE ON public.competency_topics
  FOR EACH ROW EXECUTE FUNCTION public.set_last_updated();

-- Add FK from knowledge_items to competency_topics
ALTER TABLE public.knowledge_items
  ADD CONSTRAINT fk_knowledge_items_topic
  FOREIGN KEY (topic_id) REFERENCES public.competency_topics(id) ON DELETE SET NULL;

CREATE TABLE public.autonomy_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES public.competency_topics(id) ON DELETE CASCADE,
  level public.autonomy_level NOT NULL DEFAULT 'collaborator',
  active boolean NOT NULL DEFAULT false,
  activated_at timestamptz,
  activated_by public.autonomy_activated_by
);

CREATE TABLE public.escalation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  trigger_type public.escalation_trigger_type NOT NULL,
  description text NOT NULL,
  escalation_level public.escalation_level NOT NULL DEFAULT 'informative',
  active boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  keywords text[]
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.industry_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competency_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autonomy_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalation_rules ENABLE ROW LEVEL SECURITY;

-- IndustryTemplates: read-only for all authenticated users
CREATE POLICY "templates_select_authenticated" ON public.industry_templates
  FOR SELECT TO authenticated USING (true);

-- Knowledge sources: business-scoped
CREATE POLICY "ks_select_own" ON public.knowledge_sources
  FOR SELECT USING (business_id = public.get_business_id());
CREATE POLICY "ks_insert_own" ON public.knowledge_sources
  FOR INSERT WITH CHECK (business_id = public.get_business_id());
CREATE POLICY "ks_update_own" ON public.knowledge_sources
  FOR UPDATE USING (business_id = public.get_business_id());

-- Knowledge items: business-scoped
CREATE POLICY "ki_select_own" ON public.knowledge_items
  FOR SELECT USING (business_id = public.get_business_id());
CREATE POLICY "ki_insert_own" ON public.knowledge_items
  FOR INSERT WITH CHECK (business_id = public.get_business_id());
CREATE POLICY "ki_update_own" ON public.knowledge_items
  FOR UPDATE USING (business_id = public.get_business_id());

-- Competency topics: business-scoped
CREATE POLICY "ct_select_own" ON public.competency_topics
  FOR SELECT USING (business_id = public.get_business_id());
CREATE POLICY "ct_insert_own" ON public.competency_topics
  FOR INSERT WITH CHECK (business_id = public.get_business_id());
CREATE POLICY "ct_update_own" ON public.competency_topics
  FOR UPDATE USING (business_id = public.get_business_id());

-- Autonomy rules: business-scoped
CREATE POLICY "ar_select_own" ON public.autonomy_rules
  FOR SELECT USING (business_id = public.get_business_id());
CREATE POLICY "ar_insert_own" ON public.autonomy_rules
  FOR INSERT WITH CHECK (business_id = public.get_business_id());
CREATE POLICY "ar_update_own" ON public.autonomy_rules
  FOR UPDATE USING (business_id = public.get_business_id());

-- Escalation rules: business-scoped
CREATE POLICY "er_select_own" ON public.escalation_rules
  FOR SELECT USING (business_id = public.get_business_id());
CREATE POLICY "er_insert_own" ON public.escalation_rules
  FOR INSERT WITH CHECK (business_id = public.get_business_id());
CREATE POLICY "er_update_own" ON public.escalation_rules
  FOR UPDATE USING (business_id = public.get_business_id());

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_knowledge_sources_business ON public.knowledge_sources(business_id);
CREATE INDEX idx_knowledge_items_business_active ON public.knowledge_items(business_id, active);
CREATE INDEX idx_knowledge_items_topic ON public.knowledge_items(topic_id);
CREATE INDEX idx_knowledge_items_layer ON public.knowledge_items(business_id, layer);
CREATE INDEX idx_competency_topics_business ON public.competency_topics(business_id);
CREATE INDEX idx_autonomy_rules_business ON public.autonomy_rules(business_id);
CREATE INDEX idx_autonomy_rules_topic ON public.autonomy_rules(topic_id);
CREATE INDEX idx_escalation_rules_business ON public.escalation_rules(business_id);
