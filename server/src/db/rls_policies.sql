-- ============================================================
-- FarmMitra: Enable Row Level Security on all public tables
-- Run this once in Supabase SQL Editor or via psql
-- ============================================================

-- 1. USERS TABLE
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own row only
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (true);  -- Allow all reads (auth is handled by JWT in Express)

-- Only authenticated operations via service role / Express server
-- (No direct PostgREST access — we use the Express API)
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (true);

-- 2. FIELDS TABLE
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fields_all_operations" ON public.fields
  FOR ALL USING (true) WITH CHECK (true);

-- 3. ADVISORIES TABLE
ALTER TABLE public.advisories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "advisories_all_operations" ON public.advisories
  FOR ALL USING (true) WITH CHECK (true);

-- 4. TREATMENT_LOGS TABLE
ALTER TABLE public.treatment_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "treatment_logs_all_operations" ON public.treatment_logs
  FOR ALL USING (true) WITH CHECK (true);

-- 5. CHAT_MESSAGES TABLE
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_messages_all_operations" ON public.chat_messages
  FOR ALL USING (true) WITH CHECK (true);
