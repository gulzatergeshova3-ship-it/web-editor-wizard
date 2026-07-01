CREATE OR REPLACE FUNCTION public.tg_registration_defaults()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  seq bigint;
BEGIN
  IF NEW.registration_code IS NULL THEN
    seq := (EXTRACT(EPOCH FROM now())::bigint % 100000000);
    NEW.registration_code := 'ST2026-' || lpad(seq::text, 8, '0') || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 4));
  END IF;
  IF NEW.qr_token IS NULL THEN
    NEW.qr_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  END IF;
  IF NEW.consent_at IS NULL THEN
    NEW.consent_at := now();
  END IF;
  RETURN NEW;
END $function$;