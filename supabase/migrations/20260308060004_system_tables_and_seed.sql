-- Migration 004: System tables + seed data
-- onboarding_progress, daily_summaries, notifications, industry_templates seed

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE public.onboarding_step AS ENUM (
  'industry', 'knowledge', 'escalation_rules',
  'whatsapp', 'test', 'activation', 'complete'
);

CREATE TYPE public.summary_type AS ENUM ('daily', 'weekly', 'first_week');

CREATE TYPE public.notification_channel AS ENUM ('push', 'whatsapp', 'in_app');

CREATE TYPE public.notification_status AS ENUM (
  'pending', 'sent', 'delivered', 'opened', 'failed'
);

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE public.onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
  current_step public.onboarding_step NOT NULL DEFAULT 'industry',
  industry_completed boolean NOT NULL DEFAULT false,
  knowledge_completed boolean NOT NULL DEFAULT false,
  knowledge_completeness integer NOT NULL DEFAULT 0 CHECK (knowledge_completeness BETWEEN 0 AND 100),
  escalation_rules_completed boolean NOT NULL DEFAULT false,
  whatsapp_completed boolean NOT NULL DEFAULT false,
  whatsapp_skipped boolean NOT NULL DEFAULT false,
  test_completed boolean NOT NULL DEFAULT false,
  test_messages_sent integer NOT NULL DEFAULT 0,
  activated boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  last_updated timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_onboarding_last_updated
  BEFORE UPDATE ON public.onboarding_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_last_updated();

CREATE TABLE public.daily_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  date date NOT NULL,
  type public.summary_type NOT NULL DEFAULT 'daily',
  total_conversations integer NOT NULL DEFAULT 0,
  resolved_autonomous integer NOT NULL DEFAULT 0,
  resolved_owner_approved integer NOT NULL DEFAULT 0,
  escalated integer NOT NULL DEFAULT 0,
  pending integer NOT NULL DEFAULT 0,
  estimated_minutes_saved integer NOT NULL DEFAULT 0,
  weak_topics uuid[] DEFAULT '{}',
  whatsapp_sent_at timestamptz,
  whatsapp_content text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(business_id, date)
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
  type text NOT NULL,
  channel public.notification_channel NOT NULL,
  title text NOT NULL,
  body text,
  action_url text,
  status public.notification_status NOT NULL DEFAULT 'pending',
  related_entity_type text,
  related_entity_id uuid,
  sent_at timestamptz,
  opened_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Onboarding: business-scoped
CREATE POLICY "onb_select_own" ON public.onboarding_progress
  FOR SELECT USING (business_id = public.get_business_id());
CREATE POLICY "onb_insert_own" ON public.onboarding_progress
  FOR INSERT WITH CHECK (business_id = public.get_business_id());
CREATE POLICY "onb_update_own" ON public.onboarding_progress
  FOR UPDATE USING (business_id = public.get_business_id());

-- Daily summaries: business-scoped
CREATE POLICY "ds_select_own" ON public.daily_summaries
  FOR SELECT USING (business_id = public.get_business_id());
CREATE POLICY "ds_insert_own" ON public.daily_summaries
  FOR INSERT WITH CHECK (business_id = public.get_business_id());

-- Notifications: owner-scoped
CREATE POLICY "notif_select_own" ON public.notifications
  FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "notif_insert_own" ON public.notifications
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "notif_update_own" ON public.notifications
  FOR UPDATE USING (owner_id = auth.uid());

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_onboarding_business ON public.onboarding_progress(business_id);
CREATE INDEX idx_daily_summaries_business_date ON public.daily_summaries(business_id, date DESC);
CREATE INDEX idx_notifications_owner_status ON public.notifications(owner_id, status, created_at DESC);
CREATE INDEX idx_notifications_business ON public.notifications(business_id);

-- ============================================================
-- SEED DATA: IndustryTemplates
-- ============================================================

INSERT INTO public.industry_templates (industry, name, default_topics, default_escalation_rules, sample_questions) VALUES

('restaurant', 'Restaurante',
  '[{"name":"Menú","description":"Platos, ingredientes, opciones vegetarianas/veganas"},{"name":"Horarios","description":"Horarios de apertura y cierre por día"},{"name":"Reservaciones","description":"Proceso para reservar mesa"},{"name":"Precios","description":"Precios de platos y combos"},{"name":"Ubicación","description":"Dirección, referencias, parqueo"},{"name":"Delivery","description":"Zonas de entrega, tiempos, mínimo de pedido"}]'::jsonb,
  '[{"trigger_type":"sensitive_topic","description":"Cliente menciona alergia o intolerancia alimentaria","escalation_level":"sensitive"},{"trigger_type":"sensitive_topic","description":"Cliente presenta queja sobre calidad o servicio","escalation_level":"sensitive"},{"trigger_type":"emergency_keyword","description":"Cliente reporta intoxicación o emergencia de salud","escalation_level":"urgent","keywords":["intoxicación","intoxicacion","emergencia","hospital","ambulancia"]}]'::jsonb,
  '["¿Tienen menú vegetariano?","¿A qué hora abren mañana?","¿Hacen delivery a zona 10?","¿Cuánto cuesta el almuerzo ejecutivo?","Quiero reservar mesa para 4 personas"]'::jsonb),

('clinic', 'Clínica / Consultorio Médico',
  '[{"name":"Servicios","description":"Especialidades y procedimientos disponibles"},{"name":"Horarios","description":"Horarios de atención por especialidad"},{"name":"Citas","description":"Proceso para agendar, cancelar o reprogramar citas"},{"name":"Precios","description":"Costos de consultas y procedimientos"},{"name":"Ubicación","description":"Dirección, cómo llegar, parqueo"},{"name":"Seguros","description":"Seguros aceptados y proceso de cobertura"}]'::jsonb,
  '[{"trigger_type":"emergency_keyword","description":"Paciente reporta emergencia médica","escalation_level":"urgent","keywords":["emergencia","urgencia","dolor fuerte","sangrado","desmayo","accidente"]},{"trigger_type":"sensitive_topic","description":"Paciente solicita receta o medicamento","escalation_level":"sensitive"},{"trigger_type":"sensitive_topic","description":"Paciente presenta queja sobre atención","escalation_level":"sensitive"}]'::jsonb,
  '["¿Tienen traumatología?","¿Aceptan seguro médico?","Necesito una cita para mañana","¿Cuánto cuesta la consulta general?","¿Atienden los sábados?"]'::jsonb),

('salon', 'Salón de Belleza / Barbería',
  '[{"name":"Servicios","description":"Cortes, tintes, tratamientos, manicure, etc."},{"name":"Precios","description":"Lista de precios por servicio"},{"name":"Horarios","description":"Horarios de atención y días de descanso"},{"name":"Citas","description":"Cómo agendar, política de cancelación"},{"name":"Productos","description":"Productos que se usan y venden"},{"name":"Ubicación","description":"Dirección y referencias"}]'::jsonb,
  '[{"trigger_type":"sensitive_topic","description":"Cliente reporta reacción alérgica a producto o tratamiento","escalation_level":"urgent"},{"trigger_type":"sensitive_topic","description":"Cliente presenta queja sobre resultado de servicio","escalation_level":"sensitive"},{"trigger_type":"sensitive_topic","description":"Cliente solicita reembolso o compensación","escalation_level":"sensitive"}]'::jsonb,
  '["¿Cuánto cuesta un corte de cabello?","¿Tienen citas disponibles para hoy?","¿Qué tintes manejan?","¿Hacen tratamiento de keratina?","¿A qué hora cierran?"]'::jsonb),

('retail', 'Tienda / Retail',
  '[{"name":"Productos","description":"Catálogo de productos disponibles"},{"name":"Precios","description":"Precios y promociones vigentes"},{"name":"Horarios","description":"Horarios de la tienda"},{"name":"Ubicación","description":"Dirección y sucursales"},{"name":"Disponibilidad","description":"Stock y disponibilidad de productos"},{"name":"Envíos","description":"Opciones de envío, zonas y tiempos"}]'::jsonb,
  '[{"trigger_type":"sensitive_topic","description":"Cliente reporta producto defectuoso","escalation_level":"sensitive"},{"trigger_type":"sensitive_topic","description":"Cliente solicita devolución o cambio","escalation_level":"sensitive"},{"trigger_type":"missing_info","description":"Cliente pregunta por producto que no está en catálogo","escalation_level":"informative"}]'::jsonb,
  '["¿Tienen el producto X en stock?","¿Cuánto cuesta?","¿Hacen envíos a Antigua?","¿Tienen garantía?","¿Aceptan tarjeta?"]'::jsonb),

('gym', 'Gimnasio / Centro Deportivo',
  '[{"name":"Membresías","description":"Planes, precios y beneficios"},{"name":"Horarios","description":"Horarios de apertura y clases"},{"name":"Clases","description":"Tipos de clases, horarios, instructores"},{"name":"Precios","description":"Costos de membresías y servicios adicionales"},{"name":"Ubicación","description":"Dirección y acceso"},{"name":"Instalaciones","description":"Equipos, áreas y servicios disponibles"}]'::jsonb,
  '[{"trigger_type":"emergency_keyword","description":"Miembro reporta lesión en instalaciones","escalation_level":"urgent","keywords":["lesión","lesion","accidente","emergencia","ambulancia","caída","caida"]},{"trigger_type":"sensitive_topic","description":"Miembro solicita cancelación de membresía","escalation_level":"sensitive"},{"trigger_type":"sensitive_topic","description":"Miembro presenta queja sobre instalaciones o servicio","escalation_level":"sensitive"}]'::jsonb,
  '["¿Cuánto cuesta la membresía mensual?","¿Qué clases tienen los lunes?","¿A qué hora abren?","¿Tienen estacionamiento?","¿Ofrecen entrenamiento personal?"]'::jsonb),

('professional_services', 'Servicios Profesionales',
  '[{"name":"Servicios","description":"Lista de servicios que se ofrecen"},{"name":"Precios","description":"Tarifas y formas de cobro"},{"name":"Horarios","description":"Horarios de atención"},{"name":"Proceso","description":"Cómo funciona el servicio paso a paso"},{"name":"Ubicación","description":"Dirección de oficina"},{"name":"Consultas","description":"Cómo agendar consulta inicial"}]'::jsonb,
  '[{"trigger_type":"sensitive_topic","description":"Cliente solicita documentos legales o contables urgentes","escalation_level":"sensitive"},{"trigger_type":"sensitive_topic","description":"Cliente presenta queja o reclamo formal","escalation_level":"sensitive"},{"trigger_type":"emergency_keyword","description":"Situación legal o fiscal urgente","escalation_level":"urgent","keywords":["urgente","demanda","SAT","embargo","citación","citacion","notificación judicial","notificacion judicial"]}]'::jsonb,
  '["¿Qué servicios ofrecen?","¿Cuánto cobran por consulta?","¿Cómo funciona el proceso?","¿Atienden los sábados?","¿Ofrecen asesoría virtual?"]'::jsonb);
