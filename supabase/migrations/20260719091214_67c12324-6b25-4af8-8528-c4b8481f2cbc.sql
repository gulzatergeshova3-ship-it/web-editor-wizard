ALTER TABLE public.speakers
  ALTER COLUMN name TYPE jsonb
  USING CASE
    WHEN name IS NULL OR name = '' THEN '{}'::jsonb
    ELSE jsonb_build_object('ru', name, 'en', name, 'kg', name)
  END;

ALTER TABLE public.speakers ALTER COLUMN name SET DEFAULT '{}'::jsonb;