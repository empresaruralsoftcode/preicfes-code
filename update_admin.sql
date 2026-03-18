-- 1. Añadir el rol 'admin' a user_role
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'admin';

-- 2. Modificar el trigger de nuevos usuarios para convertir admin@preicfes.com en admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  assigned_role public.user_role;
BEGIN
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

-- 3. Crear una función para que el administrador pueda eliminar usuarios desde la tabla de Auth
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

  -- Eliminar de auth.users (esto lanza CASCADE y elimina de profiles y demás tablas)
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;
