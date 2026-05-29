-- Per-user dismissals for recurring payment bell alerts (due soon / missed).
-- Scoped to a due cycle so alerts can return on the next period.

CREATE TABLE IF NOT EXISTS public.user_recurring_alert_dismissals (
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  recurring_item_id uuid NOT NULL REFERENCES public.recurring_items (id) ON DELETE CASCADE,
  alert_kind text NOT NULL CHECK (alert_kind IN ('due_soon', 'missed')),
  due_date date NOT NULL,
  dismissed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, recurring_item_id, alert_kind, due_date)
);

CREATE INDEX IF NOT EXISTS idx_recurring_alert_dismissals_user
  ON public.user_recurring_alert_dismissals (user_id);

ALTER TABLE public.user_recurring_alert_dismissals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own recurring alert dismissals"
  ON public.user_recurring_alert_dismissals;
CREATE POLICY "Users read own recurring alert dismissals"
  ON public.user_recurring_alert_dismissals FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own recurring alert dismissals"
  ON public.user_recurring_alert_dismissals;
CREATE POLICY "Users insert own recurring alert dismissals"
  ON public.user_recurring_alert_dismissals FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own recurring alert dismissals"
  ON public.user_recurring_alert_dismissals;
CREATE POLICY "Users delete own recurring alert dismissals"
  ON public.user_recurring_alert_dismissals FOR DELETE
  USING (user_id = auth.uid());
