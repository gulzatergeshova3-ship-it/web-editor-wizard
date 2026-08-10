DO $$
DECLARE tbl text; col text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['articles','speakers','sections','program_items'] LOOP
    FOREACH col IN ARRAY ARRAY['name','title','bio','description'] LOOP
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=tbl AND column_name=col) THEN
        EXECUTE format('UPDATE public.%I SET %I = %I - ''en'' WHERE %I->>''en'' IS NOT NULL AND %I->>''en'' = %I->>''ru''', tbl, col, col, col, col, col);
        EXECUTE format('UPDATE public.%I SET %I = %I - ''kg'' WHERE %I->>''kg'' IS NOT NULL AND %I->>''kg'' = %I->>''ru''', tbl, col, col, col, col, col);
      END IF;
    END LOOP;
  END LOOP;
END $$;