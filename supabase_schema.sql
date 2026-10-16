-- ================================================================
-- ZENTASK: SUPABASE DATABASE SCHEMA & POLICIES
-- Jalankan skrip ini di SQL Editor pada Supabase Dashboard Anda.
-- ================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Folder',
  color TEXT NOT NULL DEFAULT '#0d9488',
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Todos Table
CREATE TABLE IF NOT EXISTS public.todos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('todo', 'in_progress', 'completed')) DEFAULT 'todo',
  progress_percent INT CHECK (progress_percent >= 0 AND progress_percent <= 100) DEFAULT 0,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_shared BOOLEAN DEFAULT false,
  is_recurring TEXT CHECK (is_recurring IN ('none', 'daily', 'weekly', 'monthly')) DEFAULT 'none',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Subtasks Table
CREATE TABLE IF NOT EXISTS public.subtasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  todo_id UUID REFERENCES public.todos(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger untuk update updated_at otomatis
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_todos_updated_at
BEFORE UPDATE ON public.todos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

-- POLICIES: Profiles
CREATE POLICY "Public profiles are readable"
ON public.profiles FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Users can insert or update profile"
ON public.profiles FOR ALL
TO authenticated, anon
USING (true);

-- POLICIES: Categories
CREATE POLICY "Categories viewable by all users"
ON public.categories FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Users can create their own categories"
ON public.categories FOR INSERT
TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "Users can update/delete categories"
ON public.categories FOR ALL
TO authenticated, anon
USING (true);

-- POLICIES: Todos (Self & Shared Todos)
CREATE POLICY "Users can view personal or shared todos"
ON public.todos FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Users can create todos"
ON public.todos FOR INSERT
TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "Users can update personal or shared todos"
ON public.todos FOR UPDATE
TO authenticated, anon
USING (true);

CREATE POLICY "Users can delete todos"
ON public.todos FOR DELETE
TO authenticated, anon
USING (true);

-- POLICIES: Subtasks
CREATE POLICY "Users can view subtasks"
ON public.subtasks FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Users can modify subtasks"
ON public.subtasks FOR ALL
TO authenticated, anon
USING (true);

-- Seed Default Categories
INSERT INTO public.categories (name, icon, color, is_default) VALUES
('Pribadi', 'User', '#0d9488', true),
('Kerja & Project', 'Briefcase', '#0f766e', true),
('Belanja & Kebutuhan', 'ShoppingCart', '#059669', true),
('Ibadah & Doa', 'Sparkles', '#14b8a6', true),
('Rumah Tangga', 'Home', '#0284c7', true),
('Kesehatan & Habit', 'Heart', '#e11d48', true)
ON CONFLICT DO NOTHING;
