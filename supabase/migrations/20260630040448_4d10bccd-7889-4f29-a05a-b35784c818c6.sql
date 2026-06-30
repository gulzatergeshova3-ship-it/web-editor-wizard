CREATE TABLE IF NOT EXISTS public.admin_setup_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  status text NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.admin_setup_audit TO service_role;
ALTER TABLE public.admin_setup_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages admin setup audit" ON public.admin_setup_audit;
CREATE POLICY "Service role manages admin setup audit"
ON public.admin_setup_audit
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.tg_grant_admin_to_owner()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
BEGIN
  IF lower(NEW.email) = 'gulzatergeshova3@gmail.com' THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS tg_grant_admin_to_owner ON auth.users;
CREATE TRIGGER tg_grant_admin_to_owner
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.tg_grant_admin_to_owner();

INSERT INTO public.user_roles(user_id, role)
SELECT id, 'admin' FROM auth.users WHERE lower(email) = 'gulzatergeshova3@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;