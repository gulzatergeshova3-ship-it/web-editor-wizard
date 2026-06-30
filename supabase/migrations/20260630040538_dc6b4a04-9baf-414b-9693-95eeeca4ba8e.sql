CREATE POLICY "Service role manages admin setup audit"
ON public.admin_setup_audit
FOR ALL
TO service_role
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');