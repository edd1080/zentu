-- Migration: Schedule daily summaries via pg_cron + pg_net
-- Runs at 01:30 AM UTC = 7:30 PM Guatemala (UTC-6)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function that iterates over all active businesses with WhatsApp connected
-- and triggers generate-daily-summary for each via HTTP
CREATE OR REPLACE FUNCTION public.trigger_daily_summaries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_business RECORD;
  v_today    text := to_char(NOW() AT TIME ZONE 'America/Guatemala', 'YYYY-MM-DD');
  v_edge_url text := current_setting('app.supabase_url', true) || '/functions/v1/generate-daily-summary';
  v_service_key text := current_setting('app.service_role_key', true);
BEGIN
  FOR v_business IN
    SELECT id
    FROM public.businesses
    WHERE whatsapp_status = 'connected'
      AND activated_at IS NOT NULL
  LOOP
    PERFORM pg_net.http_post(
      url     := v_edge_url,
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || v_service_key
      ),
      body    := jsonb_build_object(
        'business_id', v_business.id,
        'date',        v_today,
        'type',        'daily'
      )::text
    );
  END LOOP;
END;
$$;

-- Schedule: every day at 01:30 UTC (7:30 PM Guatemala)
SELECT cron.schedule(
  'daily-summaries',
  '30 1 * * *',
  'SELECT public.trigger_daily_summaries()'
);
