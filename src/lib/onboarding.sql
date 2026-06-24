ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_activity TEXT CHECK (onboarding_activity IN ('consultant', 'coach', 'freelance', 'artisan', 'autre'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_cycle TEXT CHECK (onboarding_cycle IN ('court', 'long', 'devis', 'appel'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_delay INTEGER CHECK (onboarding_delay IN (3, 5, 7, 14));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_goal TEXT CHECK (onboarding_goal IN ('relance', 'devis', 'pipeline'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_channels TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_summary TEXT CHECK (onboarding_summary IN ('matin', 'hebdo', 'jamais'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_done BOOLEAN DEFAULT FALSE;
UPDATE public.profiles SET onboarding_done = FALSE WHERE onboarding_done IS NULL;
