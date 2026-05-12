
DROP POLICY IF EXISTS "own select" ON public.fortune_reports;
DROP POLICY IF EXISTS "own insert" ON public.fortune_reports;
DROP POLICY IF EXISTS "own update" ON public.fortune_reports;
DROP POLICY IF EXISTS "own delete" ON public.fortune_reports;

CREATE POLICY "Public read fortune_reports" ON public.fortune_reports FOR SELECT USING (true);
CREATE POLICY "Public insert fortune_reports" ON public.fortune_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update fortune_reports" ON public.fortune_reports FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete fortune_reports" ON public.fortune_reports FOR DELETE USING (true);
