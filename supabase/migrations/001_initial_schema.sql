-- PoysaPath Phase 1: profiles, categories, expenses, RLS, seed, sign-up trigger

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

-- Categories (user_id NULL = system template for sign-up copy)
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles (id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories (user_id);

-- Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories (id),
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  note text,
  payment_method text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses (user_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_category ON public.expenses (user_id, category_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS expenses_set_updated_at ON public.expenses;
CREATE TRIGGER expenses_set_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- Categories policies
DROP POLICY IF EXISTS "Users read categories" ON public.categories;
CREATE POLICY "Users read categories"
  ON public.categories FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own categories" ON public.categories;
CREATE POLICY "Users insert own categories"
  ON public.categories FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own categories" ON public.categories;
CREATE POLICY "Users update own categories"
  ON public.categories FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own categories" ON public.categories;
CREATE POLICY "Users delete own categories"
  ON public.categories FOR DELETE
  USING (user_id = auth.uid());

-- Expenses policies
DROP POLICY IF EXISTS "Users read own expenses" ON public.expenses;
CREATE POLICY "Users read own expenses"
  ON public.expenses FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own expenses" ON public.expenses;
CREATE POLICY "Users insert own expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own expenses" ON public.expenses;
CREATE POLICY "Users update own expenses"
  ON public.expenses FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own expenses" ON public.expenses;
CREATE POLICY "Users delete own expenses"
  ON public.expenses FOR DELETE
  USING (user_id = auth.uid());

-- System category templates (run once)
INSERT INTO public.categories (user_id, name, icon, sort_order)
SELECT NULL, v.name, v.icon, v.sort_order
FROM (
  VALUES
    ('Food', '🍽️', 1),
    ('Transport', '🚌', 2),
    ('Rent / Housing', '🏠', 3),
    ('Utilities', '💡', 4),
    ('Shopping', '🛒', 5),
    ('Health', '💊', 6),
    ('Entertainment', '🎬', 7),
    ('Education', '📚', 8),
    ('Other', '📦', 9)
) AS v(name, icon, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories WHERE user_id IS NULL LIMIT 1
);

-- Sign-up: profile + copy categories
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.categories (user_id, name, icon, sort_order)
  SELECT NEW.id, c.name, c.icon, c.sort_order
  FROM public.categories c
  WHERE c.user_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.categories uc WHERE uc.user_id = NEW.id LIMIT 1
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
