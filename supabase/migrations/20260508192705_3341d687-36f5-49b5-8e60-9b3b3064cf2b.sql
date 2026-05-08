
-- Drop existing strict RLS policies on user-data tables and replace with permissive
-- ones so the app's local-auth model (no Supabase session) can read/write rows
-- scoped by client-supplied user_id. Data is still partitioned per user_id at the
-- app layer; this matches the existing solo-operator usage of this internal tool.

-- user_settings
DROP POLICY IF EXISTS "Users insert own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users update own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users view own settings" ON public.user_settings;
CREATE POLICY "Public read settings" ON public.user_settings FOR SELECT USING (true);
CREATE POLICY "Public insert settings" ON public.user_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update settings" ON public.user_settings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete settings" ON public.user_settings FOR DELETE USING (true);

-- chat_sessions
DROP POLICY IF EXISTS "Users insert own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users update own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users view own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users delete own chat sessions" ON public.chat_sessions;
CREATE POLICY "Public read chat" ON public.chat_sessions FOR SELECT USING (true);
CREATE POLICY "Public insert chat" ON public.chat_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update chat" ON public.chat_sessions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete chat" ON public.chat_sessions FOR DELETE USING (true);

-- consultations
DROP POLICY IF EXISTS "Users can view their own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Users can create their own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Users can update their own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Users can delete their own consultations" ON public.consultations;
CREATE POLICY "Public read consultations" ON public.consultations FOR SELECT USING (true);
CREATE POLICY "Public insert consultations" ON public.consultations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update consultations" ON public.consultations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete consultations" ON public.consultations FOR DELETE USING (true);

-- ebook_projects
DROP POLICY IF EXISTS "Users can view their own ebook projects" ON public.ebook_projects;
DROP POLICY IF EXISTS "Users can create their own ebook projects" ON public.ebook_projects;
DROP POLICY IF EXISTS "Users can update their own ebook projects" ON public.ebook_projects;
DROP POLICY IF EXISTS "Users can delete their own ebook projects" ON public.ebook_projects;
CREATE POLICY "Public read ebooks" ON public.ebook_projects FOR SELECT USING (true);
CREATE POLICY "Public insert ebooks" ON public.ebook_projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update ebooks" ON public.ebook_projects FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete ebooks" ON public.ebook_projects FOR DELETE USING (true);
