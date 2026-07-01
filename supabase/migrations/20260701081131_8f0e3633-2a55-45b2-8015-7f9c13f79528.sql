ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS email_status text,
  ADD COLUMN IF NOT EXISTS email_error text;