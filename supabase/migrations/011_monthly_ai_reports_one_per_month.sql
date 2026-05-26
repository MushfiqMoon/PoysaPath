-- Phase 6 update: keep one saved monthly AI report per user and month

WITH ranked_reports AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY user_id, report_month
      ORDER BY updated_at DESC, generated_at DESC, created_at DESC, id DESC
    ) AS report_rank
  FROM public.monthly_ai_reports
)
DELETE FROM public.monthly_ai_reports reports
USING ranked_reports ranked
WHERE reports.id = ranked.id
  AND ranked.report_rank > 1;

ALTER TABLE public.monthly_ai_reports
  DROP CONSTRAINT IF EXISTS monthly_ai_reports_user_id_report_month_language_key;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'monthly_ai_reports_user_id_report_month_key'
      AND conrelid = 'public.monthly_ai_reports'::regclass
  ) THEN
    ALTER TABLE public.monthly_ai_reports
      ADD CONSTRAINT monthly_ai_reports_user_id_report_month_key
      UNIQUE (user_id, report_month);
  END IF;
END $$;
