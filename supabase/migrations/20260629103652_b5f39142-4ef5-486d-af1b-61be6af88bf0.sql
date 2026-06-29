
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

-- If the user already exists (e.g. from a previous attempt), grant immediately
INSERT INTO public.user_roles(user_id, role)
SELECT id, 'admin' FROM auth.users WHERE lower(email) = 'gulzatergeshova3@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
