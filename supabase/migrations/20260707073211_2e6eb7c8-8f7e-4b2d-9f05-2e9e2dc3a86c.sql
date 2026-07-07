-- Restrict EXECUTE on SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.checkin_registration(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.checkin_registration(text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.tg_grant_admin_to_owner() FROM PUBLIC, anon, authenticated;
