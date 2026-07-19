
CREATE TABLE IF NOT EXISTS public.app_secrets (
  name text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
GRANT ALL ON public.app_secrets TO service_role;
ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no direct access" ON public.app_secrets FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);
