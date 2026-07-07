GRANT INSERT ON public.registrations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registrations TO authenticated;
GRANT ALL ON public.registrations TO service_role;