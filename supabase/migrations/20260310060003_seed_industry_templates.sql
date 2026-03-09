-- Migration: Seed industry_templates
-- Adds default rows for the onboarding flow M1.2

INSERT INTO public.industry_templates (id, industry, name, default_topics, default_escalation_rules, sample_questions)
VALUES 
  (gen_random_uuid(), 'restaurant', 'Restaurante / Café', '[{"name": "Horarios", "description": "Horario de atención"}, {"name": "Menú", "description": "Datos del menú y platos"}, {"name": "Ubicación", "description": "Dirección física"}, {"name": "Reservas", "description": "Cómo agendar una mesa"}]', '[]', '[]'),
  (gen_random_uuid(), 'clinic', 'Clínica / Salud', '[{"name": "Citas", "description": "Agendar o cancelar consultas"}, {"name": "Servicios médicos", "description": "Especialidades disponibles"}, {"name": "Cobertura", "description": "Seguros y planes"}]', '[]', '[]'),
  (gen_random_uuid(), 'salon', 'Estética / Salón', '[{"name": "Citas", "description": "Agendar cita"}, {"name": "Precios", "description": "Costo de servicios"}, {"name": "Servicios", "description": "Lista de cortes, uñas, etc."}]', '[]', '[]'),
  (gen_random_uuid(), 'retail', 'Tienda Física', '[{"name": "Inventario", "description": "Consultar si hay stock"}, {"name": "Horarios", "description": "Apertura y cierre"}, {"name": "Devoluciones", "description": "Política de devolución"}]', '[]', '[]'),
  (gen_random_uuid(), 'gym', 'Gimnasio', '[{"name": "Membresías", "description": "Precios y mensualidades"}, {"name": "Clases grupales", "description": "Yoga, spinning, etc."}, {"name": "Horarios", "description": "Horas de la instalación"}]', '[]', '[]'),
  (gen_random_uuid(), 'professional_services', 'Servicios Profesionales', '[{"name": "Cotizaciones", "description": "Pedir un presupuesto"}, {"name": "Servicios", "description": "Catálogo de lo que hacen"}]', '[]', '[]'),
  (gen_random_uuid(), 'other', 'Otro', '[{"name": "Información", "description": "Datos generales"}, {"name": "Ventas", "description": "Información de compra"}]', '[]', '[]')
ON CONFLICT (industry) DO UPDATE 
SET 
  default_topics = EXCLUDED.default_topics,
  name = EXCLUDED.name;
