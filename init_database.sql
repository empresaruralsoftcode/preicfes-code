-- Eliminar objetos previos si los hay (Opcional, limpiar el esquema si quieres empezar limpio)
-- DROP TABLE IF EXISTS public.student_answers CASCADE;
-- DROP TABLE IF EXISTS public.student_exams CASCADE;
-- DROP TABLE IF EXISTS public.options CASCADE;
-- DROP TABLE IF EXISTS public.questions CASCADE;
-- DROP TABLE IF EXISTS public.exams CASCADE;
-- DROP TABLE IF EXISTS public.teacher_components CASCADE;
-- DROP TABLE IF EXISTS public.components CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;
-- DROP TYPE IF EXISTS public.question_type CASCADE;
-- DROP TYPE IF EXISTS public.user_role CASCADE;

-- 1. Crear Custom Types (Roles y Tipos de Preguntas)
-- Usamos validaciones anónimas seguras por si ya existen en tu base de datos actual.
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('student', 'teacher', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.question_type AS ENUM ('single', 'multiple', 'open');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Crear Tabla de Perfiles (Profiles) asociada a auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Crear Componentes (Materias) y llenarlas por defecto
CREATE TABLE IF NOT EXISTS public.components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

INSERT INTO public.components (name) VALUES ('Matemáticas'), ('Ciencias'), ('Sociales'), ('Lectura Crítica')
ON CONFLICT DO NOTHING;

-- 4. Componentes Asignados al Docente
CREATE TABLE IF NOT EXISTS public.teacher_components (
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  component_id UUID REFERENCES public.components(id) ON DELETE CASCADE,
  PRIMARY KEY (teacher_id, component_id)
);

-- 5. Exámenes (Cabecera del Simulacro)
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  component_id UUID REFERENCES public.components(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL,
  question_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Preguntas
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  statement TEXT NOT NULL,
  type public.question_type NOT NULL,
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Opciones de Múltiple Elección
CREATE TABLE IF NOT EXISTS public.options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false
);

-- 8. Intentos de los Estudiantes
CREATE TABLE IF NOT EXISTS public.student_exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  score NUMERIC,
  UNIQUE(student_id, exam_id)
);

-- 9. Respuestas Guardadas
CREATE TABLE IF NOT EXISTS public.student_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_exam_id UUID REFERENCES public.student_exams(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  media_url TEXT,
  selected_option_ids UUID[]
);

-- 10. Crear el Bucket de Almacenamiento (Si no existe)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('exam-media', 'exam-media', true) 
ON CONFLICT (id) DO NOTHING;

-- Borrar políticas previas si existían para evitar colisión, luego re-crearlas
DROP POLICY IF EXISTS "Give public access to exam-media" ON storage.objects;
CREATE POLICY "Give public access to exam-media" ON storage.objects FOR SELECT USING (bucket_id = 'exam-media');

DROP POLICY IF EXISTS "Give authenticated inserts to exam-media" ON storage.objects;
CREATE POLICY "Give authenticated inserts to exam-media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'exam-media');

-- 11. Trigger de Creación Automática de Usuario Auth -> Perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  assigned_role public.user_role;
BEGIN
  -- Convertir la cuenta admin@preicfes.com en Administrador, de lo contrario lo asignado o default.
  IF NEW.email = 'admin@preicfes.com' THEN
    assigned_role := 'admin'::public.user_role;
  ELSE
    assigned_role := coalesce((NEW.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role);
  END IF;

  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    coalesce(NEW.raw_user_meta_data->>'full_name', NEW.email),
    assigned_role
  )
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
  
  RETURN NEW;
END;
$$;

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    DROP TRIGGER on_auth_user_created ON auth.users;
  END IF;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 12. Procedimiento Almacenado de Admin Delete (Borrar cuentas completas del lado de Supabase)
CREATE OR REPLACE FUNCTION public.delete_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, auth
AS $$
BEGIN
  -- Validar que quien ejecuta la función sea un administrador
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Aceso denegado: Solo los administradores pueden eliminar usuarios.';
  END IF;

  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

-- 13. Procedimiento Almacenado de Admin Create (Crear usuarios desde el admin)
CREATE OR REPLACE FUNCTION public.create_user_by_admin(
  new_email TEXT, 
  new_password TEXT, 
  new_name TEXT, 
  new_role public.user_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, auth
AS $$
DECLARE
  uid UUID;
BEGIN
  -- 1. Validar que quien ejecuta la función sea un administrador
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Acceso denegado: Solo administradores.';
  END IF;

  uid := gen_random_uuid();

  -- 2. Insertar en auth.users
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', new_email, 
    crypt(new_password, gen_salt('bf')),
    now(), now(), now(), 
    '{"provider":"email","providers":["email"]}', 
    json_build_object('full_name', new_name, 'role', new_role), 
    now(), now(), '', '', '', ''
  );

  -- 3. Insertar Identidad requerida para inicio de Sesión con contraseñas en Supabase (GoTrue)
  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), uid, uid::text, 
    jsonb_build_object('sub', uid, 'email', new_email, 'email_verified', true), 
    'email', now(), now()
  );
END;
$$;

-- 13. Creación automatizada del usuario Administrador
-- Nota: La contraseña para entrar será "admin123"
DO $$ 
DECLARE 
  uid UUID;
BEGIN
  uid := gen_random_uuid();
  -- Insertamos en auth.users si no existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@preicfes.com') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@preicfes.com', 
      crypt('admin123', gen_salt('bf')), -- Contraseña encriptada para login ('admin123')
      now(), now(), now(), 
      '{"provider":"email","providers":["email"]}', '{"full_name": "Administrador Principal"}', 
      now(), now(), '', '', '', ''
    );
  END IF;
END $$;

