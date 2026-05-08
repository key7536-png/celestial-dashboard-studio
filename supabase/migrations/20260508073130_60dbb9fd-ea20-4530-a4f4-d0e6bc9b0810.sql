ALTER TABLE public.ebook_projects
  ADD COLUMN IF NOT EXISTS subtitle text,
  ADD COLUMN IF NOT EXISTS style text,
  ADD COLUMN IF NOT EXISTS book_type text DEFAULT 'single',
  ADD COLUMN IF NOT EXISTS content jsonb,
  ADD COLUMN IF NOT EXISTS selected_theme text DEFAULT 'midnight';