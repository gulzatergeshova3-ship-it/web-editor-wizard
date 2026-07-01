
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS registration_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS qr_token text UNIQUE,
  ADD COLUMN IF NOT EXISTS email_sent_at timestamptz;

-- Auto-generate registration_code and qr_token on insert
CREATE OR REPLACE FUNCTION public.tg_registration_defaults()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  seq bigint;
BEGIN
  IF NEW.registration_code IS NULL THEN
    seq := (EXTRACT(EPOCH FROM now())::bigint % 100000000);
    NEW.registration_code := 'ST2026-' || lpad(seq::text, 8, '0') || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 4));
  END IF;
  IF NEW.qr_token IS NULL THEN
    NEW.qr_token := encode(gen_random_bytes(24), 'hex');
  END IF;
  IF NEW.consent_at IS NULL THEN
    NEW.consent_at := now();
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_registration_defaults ON public.registrations;
CREATE TRIGGER trg_registration_defaults
  BEFORE INSERT ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.tg_registration_defaults();
