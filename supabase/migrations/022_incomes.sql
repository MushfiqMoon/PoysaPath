-- Income tracking: incomes table, category kind, income templates, sign-up + backfill

-- Category kind (expense vs income)
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'expense';

ALTER TABLE public.categories
  DROP CONSTRAINT IF EXISTS categories_kind_check;

ALTER TABLE public.categories
  ADD CONSTRAINT categories_kind_check
  CHECK (kind IN ('expense', 'income'));

COMMENT ON COLUMN public.categories.kind IS
  'expense = spending categories; income = income source categories';

-- Mark existing system + user categories as expense
UPDATE public.categories SET kind = 'expense' WHERE kind IS NULL OR kind = 'expense';

-- Income system templates
INSERT INTO public.categories (user_id, name, icon, sort_order, kind)
SELECT NULL, v.name, v.icon, v.sort_order, 'income'
FROM (
  VALUES
    ('Salary', '💼', 1),
    ('Freelance / Business', '💻', 2),
    ('Investment returns', '📈', 3),
    ('Other income', '💰', 4)
) AS v(name, icon, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories
  WHERE user_id IS NULL AND kind = 'income'
  LIMIT 1
);

-- Incomes table
CREATE TABLE IF NOT EXISTS public.incomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories (id),
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  income_date date NOT NULL DEFAULT CURRENT_DATE,
  note text,
  payment_method text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incomes_user_date ON public.incomes (user_id, income_date DESC);
CREATE INDEX IF NOT EXISTS idx_incomes_user_category ON public.incomes (user_id, category_id);

DROP TRIGGER IF EXISTS incomes_set_updated_at ON public.incomes;
CREATE TRIGGER incomes_set_updated_at
  BEFORE UPDATE ON public.incomes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own incomes" ON public.incomes;
CREATE POLICY "Users read own incomes"
  ON public.incomes FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own incomes" ON public.incomes;
CREATE POLICY "Users insert own incomes"
  ON public.incomes FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own incomes" ON public.incomes;
CREATE POLICY "Users update own incomes"
  ON public.incomes FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own incomes" ON public.incomes;
CREATE POLICY "Users delete own incomes"
  ON public.incomes FOR DELETE
  USING (user_id = auth.uid());

-- Sign-up: copy expense + income templates
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    public.oauth_profile_display_name(NEW.raw_user_meta_data),
    public.oauth_profile_avatar_url(NEW.raw_user_meta_data)
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.categories (user_id, name, icon, sort_order, kind)
  SELECT NEW.id, c.name, c.icon, c.sort_order, c.kind
  FROM public.categories c
  WHERE c.user_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.categories uc WHERE uc.user_id = NEW.id LIMIT 1
  );

  RETURN NEW;
END;
$$;

-- Backfill income categories for existing users
INSERT INTO public.categories (user_id, name, icon, sort_order, kind)
SELECT p.id, t.name, t.icon, t.sort_order, 'income'
FROM public.profiles p
CROSS JOIN (
  VALUES
    ('Salary', '💼', 1),
    ('Freelance / Business', '💻', 2),
    ('Investment returns', '📈', 3),
    ('Other income', '💰', 4)
) AS t(name, icon, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c
  WHERE c.user_id = p.id AND c.kind = 'income'
  LIMIT 1
);
