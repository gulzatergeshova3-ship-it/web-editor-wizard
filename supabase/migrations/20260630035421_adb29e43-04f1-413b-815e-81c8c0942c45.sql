
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

GRANT SELECT ON public.sections TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.sections TO authenticated;
GRANT ALL ON public.sections TO service_role;

GRANT SELECT ON public.speakers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.speakers TO authenticated;
GRANT ALL ON public.speakers TO service_role;

GRANT SELECT ON public.program_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.program_items TO authenticated;
GRANT ALL ON public.program_items TO service_role;

GRANT SELECT ON public.partners TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.partners TO authenticated;
GRANT ALL ON public.partners TO service_role;

GRANT INSERT ON public.registrations TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.registrations TO authenticated;
GRANT ALL ON public.registrations TO service_role;
