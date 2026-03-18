-- Create custom types
CREATE TYPE public.user_role AS ENUM ('student', 'teacher');
CREATE TYPE public.question_type AS ENUM ('single', 'multiple', 'open');

-- Profiles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Components
CREATE TABLE public.components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

INSERT INTO public.components (name) VALUES ('Matemáticas'), ('Ciencias'), ('Sociales'), ('Lectura Crítica');

-- Teacher Components
CREATE TABLE public.teacher_components (
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  component_id UUID REFERENCES public.components(id) ON DELETE CASCADE,
  PRIMARY KEY (teacher_id, component_id)
);

-- Exams
CREATE TABLE public.exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  component_id UUID REFERENCES public.components(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL,
  question_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions
CREATE TABLE public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  statement TEXT NOT NULL,
  type public.question_type NOT NULL,
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Options
CREATE TABLE public.options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false
);

-- Student Exams
CREATE TABLE public.student_exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  score NUMERIC,
  UNIQUE(student_id, exam_id)
);

-- Student Answers
CREATE TABLE public.student_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_exam_id UUID REFERENCES public.student_exams(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  media_url TEXT,
  selected_option_ids UUID[]
);

-- Buckets (Storage)
INSERT INTO storage.buckets (id, name, public) VALUES ('exam-media', 'exam-media', true) ON CONFLICT DO NOTHING;

-- Storage Policies
CREATE POLICY "Give public access to exam-media" ON storage.objects FOR SELECT USING (bucket_id = 'exam-media');
CREATE POLICY "Give authenticated inserts to exam-media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'exam-media');

-- Trigger to create profile after sign up automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    coalesce(NEW.raw_user_meta_data->>'full_name', NEW.email),
    coalesce((NEW.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
