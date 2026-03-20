-- Migration: Settings columns for Bloque 5.3
-- Adds notification preferences to businesses
-- Adds knowledge_count computed column to competency_topics

-- Notification preferences on businesses
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS notification_hour integer NOT NULL DEFAULT 20
    CHECK (notification_hour BETWEEN 0 AND 23),
  ADD COLUMN IF NOT EXISTS quiet_hours_start integer NOT NULL DEFAULT 22
    CHECK (quiet_hours_start BETWEEN 0 AND 23),
  ADD COLUMN IF NOT EXISTS quiet_hours_end integer NOT NULL DEFAULT 7
    CHECK (quiet_hours_end BETWEEN 0 AND 23),
  ADD COLUMN IF NOT EXISTS notify_training_alerts boolean NOT NULL DEFAULT true;

-- knowledge_count on competency_topics (count of active knowledge_items per topic)
ALTER TABLE public.competency_topics
  ADD COLUMN IF NOT EXISTS knowledge_count integer NOT NULL DEFAULT 0;

-- Backfill knowledge_count for existing rows
UPDATE public.competency_topics ct
SET knowledge_count = (
  SELECT COUNT(*)::integer
  FROM public.knowledge_items ki
  WHERE ki.topic_id = ct.id
    AND ki.active = true
);

-- Update refresh_competency_coverage to also maintain knowledge_count
CREATE OR REPLACE FUNCTION public.refresh_competency_coverage(p_business_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.competency_topics ct
  SET
    knowledge_count = (
      SELECT COUNT(*)::integer
      FROM public.knowledge_items ki
      WHERE ki.topic_id = ct.id
        AND ki.active = true
    ),
    coverage_percentage = LEAST(
      (
        SELECT COUNT(*)::integer
        FROM public.knowledge_items ki
        WHERE ki.topic_id = ct.id
          AND ki.active = true
      ) * 25,
      100
    ),
    status = CASE
      WHEN LEAST(
        (
          SELECT COUNT(*)::integer
          FROM public.knowledge_items ki
          WHERE ki.topic_id = ct.id
            AND ki.active = true
        ) * 25,
        100
      ) >= 70 THEN 'strong'::public.competency_status
      WHEN LEAST(
        (
          SELECT COUNT(*)::integer
          FROM public.knowledge_items ki
          WHERE ki.topic_id = ct.id
            AND ki.active = true
        ) * 25,
        100
      ) >= 30 THEN 'partial'::public.competency_status
      ELSE 'weak'::public.competency_status
    END
  WHERE ct.business_id = p_business_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.refresh_competency_coverage(uuid) TO authenticated;
