-- Migration: Add refresh_competency_coverage function
-- Recalculates coverage_percentage and status for competency_topics
-- based on the count of active knowledge_items per topic.
-- Used in dev to seed real values, and called by the nightly cron after launch.

CREATE OR REPLACE FUNCTION public.refresh_competency_coverage(p_business_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.competency_topics ct
  SET
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

-- Allow authenticated users to call this function (scoped by their own business_id)
GRANT EXECUTE ON FUNCTION public.refresh_competency_coverage(uuid) TO authenticated;

-- Run immediately for all existing businesses to seed current data
DO $$
DECLARE
  biz RECORD;
BEGIN
  FOR biz IN SELECT id FROM public.businesses LOOP
    PERFORM public.refresh_competency_coverage(biz.id);
  END LOOP;
END;
$$;
