CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'froid' CHECK (status IN ('chaud', 'tiede', 'froid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  amount DECIMAL(10,2),
  stage TEXT DEFAULT 'prospect' CHECK (stage IN ('prospect', 'discussion', 'devis', 'gagne', 'perdu')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  subscribed BOOLEAN DEFAULT FALSE,
  subscription_id TEXT,
  onboarding_activity TEXT CHECK (onboarding_activity IN ('consultant', 'coach', 'freelance', 'artisan', 'autre')),
  onboarding_cycle TEXT CHECK (onboarding_cycle IN ('court', 'long', 'devis', 'appel')),
  onboarding_delay INTEGER CHECK (onboarding_delay IS NULL OR onboarding_delay > 0),
  onboarding_goal TEXT CHECK (onboarding_goal IN ('relance', 'devis', 'pipeline')),
  onboarding_channels TEXT[],
  onboarding_summary TEXT CHECK (onboarding_summary IN ('matin', 'hebdo', 'jamais')),
  onboarding_done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_activity TEXT CHECK (onboarding_activity IN ('consultant', 'coach', 'freelance', 'artisan', 'autre'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_cycle TEXT CHECK (onboarding_cycle IN ('court', 'long', 'devis', 'appel'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_delay INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_goal TEXT CHECK (onboarding_goal IN ('relance', 'devis', 'pipeline'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_channels TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_summary TEXT CHECK (onboarding_summary IN ('matin', 'hebdo', 'jamais'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_done BOOLEAN DEFAULT FALSE;

-- Délai de relance : libre (en jours), seulement > 0. Remplace l'ancienne contrainte IN (3,5,7,14).
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_onboarding_delay_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_onboarding_delay_check CHECK (onboarding_delay IS NULL OR onboarding_delay > 0);
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
UPDATE public.deals SET updated_at = COALESCE(updated_at, created_at, NOW()) WHERE updated_at IS NULL;

-- Mémoire de contexte relationnel : note libre par deal et par contact (ce qui a été dit/promis).
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS context_note TEXT;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS context_note TEXT;

DROP POLICY IF EXISTS "Users see own contacts" ON public.contacts;
CREATE POLICY "Users see own contacts" ON public.contacts
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users see own deals" ON public.deals;
CREATE POLICY "Users see own deals" ON public.deals
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users see own profile" ON public.profiles;
CREATE POLICY "Users see own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

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

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_deal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_deal_updated_at ON public.deals;
CREATE TRIGGER set_deal_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.set_deal_updated_at();
