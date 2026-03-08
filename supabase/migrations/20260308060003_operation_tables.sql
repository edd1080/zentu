-- Migration 003: Operation tables
-- conversations, messages, suggestions, escalations

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE public.conversation_status AS ENUM (
  'active', 'pending_approval', 'escalated_informative',
  'escalated_sensitive', 'escalated_urgent',
  'waiting', 'resolved', 'archived'
);

CREATE TYPE public.conversation_priority AS ENUM (
  'normal', 'elevated', 'urgent'
);

CREATE TYPE public.resolved_by_type AS ENUM (
  'agent_autonomous', 'owner_approved', 'owner_manual', 'pending'
);

CREATE TYPE public.message_direction AS ENUM ('inbound', 'outbound');

CREATE TYPE public.sender_type AS ENUM (
  'client', 'agent', 'owner', 'system'
);

CREATE TYPE public.media_type AS ENUM (
  'text', 'image', 'audio', 'document'
);

CREATE TYPE public.message_delivery_status AS ENUM (
  'sent', 'delivered', 'read', 'failed'
);

CREATE TYPE public.suggestion_status AS ENUM (
  'pending', 'approved', 'edited', 'rejected', 'expired', 'auto_sent'
);

CREATE TYPE public.confidence_tier AS ENUM ('high', 'medium', 'low');

CREATE TYPE public.escalation_entry_status AS ENUM (
  'active', 'attended', 'resolved'
);

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  client_phone text NOT NULL,
  client_name text,
  status public.conversation_status NOT NULL DEFAULT 'active',
  priority public.conversation_priority NOT NULL DEFAULT 'normal',
  last_message_at timestamptz,
  last_message_preview text,
  first_message_at timestamptz NOT NULL DEFAULT now(),
  total_messages integer NOT NULL DEFAULT 0,
  resolved_by public.resolved_by_type NOT NULL DEFAULT 'pending',
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  direction public.message_direction NOT NULL,
  sender_type public.sender_type NOT NULL,
  content text,
  media_type public.media_type,
  media_url text,
  whatsapp_message_id text,
  status public.message_delivery_status,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  content text NOT NULL,
  confidence decimal NOT NULL CHECK (confidence BETWEEN 0.0 AND 1.0),
  confidence_tier public.confidence_tier NOT NULL,
  detected_intent text,
  detected_intent_label text,
  knowledge_items_used uuid[] DEFAULT '{}',
  status public.suggestion_status NOT NULL DEFAULT 'pending',
  final_content text,
  correction_validity public.knowledge_validity,
  correction_valid_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by_owner boolean
);

CREATE TABLE public.escalations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  level public.escalation_level NOT NULL,
  reason text NOT NULL,
  trigger_rule_id uuid REFERENCES public.escalation_rules(id) ON DELETE SET NULL,
  status public.escalation_entry_status NOT NULL DEFAULT 'active',
  containment_message_sent boolean NOT NULL DEFAULT false,
  containment_message_content text,
  notified_push_at timestamptz,
  notified_whatsapp_at timestamptz,
  attended_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalations ENABLE ROW LEVEL SECURITY;

-- Conversations: business-scoped
CREATE POLICY "conv_select_own" ON public.conversations
  FOR SELECT USING (business_id = public.get_business_id());
CREATE POLICY "conv_insert_own" ON public.conversations
  FOR INSERT WITH CHECK (business_id = public.get_business_id());
CREATE POLICY "conv_update_own" ON public.conversations
  FOR UPDATE USING (business_id = public.get_business_id());

-- Messages: through conversation ownership
CREATE POLICY "msg_select_own" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.business_id = public.get_business_id()
    )
  );
CREATE POLICY "msg_insert_own" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.business_id = public.get_business_id()
    )
  );

-- Suggestions: business-scoped
CREATE POLICY "sug_select_own" ON public.suggestions
  FOR SELECT USING (business_id = public.get_business_id());
CREATE POLICY "sug_insert_own" ON public.suggestions
  FOR INSERT WITH CHECK (business_id = public.get_business_id());
CREATE POLICY "sug_update_own" ON public.suggestions
  FOR UPDATE USING (business_id = public.get_business_id());

-- Escalations: business-scoped
CREATE POLICY "esc_select_own" ON public.escalations
  FOR SELECT USING (business_id = public.get_business_id());
CREATE POLICY "esc_insert_own" ON public.escalations
  FOR INSERT WITH CHECK (business_id = public.get_business_id());
CREATE POLICY "esc_update_own" ON public.escalations
  FOR UPDATE USING (business_id = public.get_business_id());

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_conv_business_status ON public.conversations(business_id, status);
CREATE INDEX idx_conv_business_last_msg ON public.conversations(business_id, last_message_at DESC);
CREATE INDEX idx_conv_client_phone ON public.conversations(business_id, client_phone);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);
CREATE INDEX idx_messages_whatsapp_id ON public.messages(whatsapp_message_id);
CREATE INDEX idx_suggestions_conv ON public.suggestions(conversation_id);
CREATE INDEX idx_suggestions_business_status ON public.suggestions(business_id, status);
CREATE INDEX idx_escalations_conv ON public.escalations(conversation_id);
CREATE INDEX idx_escalations_business_status ON public.escalations(business_id, status);
