ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
UPDATE public.deals SET updated_at = COALESCE(updated_at, created_at, NOW()) WHERE updated_at IS NULL;

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
