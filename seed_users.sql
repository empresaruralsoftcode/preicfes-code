DO $$ 
DECLARE 
  uid UUID;
BEGIN
  -- 1. Crear al Administrador Principal
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@preicfes.com') THEN
    uid := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
    VALUES (uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@preicfes.com', crypt('admin123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Administrador Principal", "role": "admin"}', now(), now());
  END IF;

  -- 2. Crear a Carlos Hurtado (Docente)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'carlos.hurtado@preicfes.com') THEN
    uid := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
    VALUES (uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'carlos.hurtado@preicfes.com', crypt('docente123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Carlos Hurtado", "role": "teacher"}', now(), now());
  END IF;

  -- 3. Crear a Lina Vidal (Docente)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'lina.vidal@preicfes.com') THEN
    uid := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
    VALUES (uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lina.vidal@preicfes.com', crypt('docente123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Lina Vidal", "role": "teacher"}', now(), now());
  END IF;

  -- 4. Crear a Sebastian Ocaña (Estudiante)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'sebastian.ocana@preicfes.com') THEN
    uid := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
    VALUES (uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sebastian.ocana@preicfes.com', crypt('estudiante123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Sebastian Ocaña", "role": "student"}', now(), now());
  END IF;

  -- 5. Crear a Kevin Ocaña (Estudiante)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'kevin.ocana@preicfes.com') THEN
    uid := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
    VALUES (uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kevin.ocana@preicfes.com', crypt('estudiante123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Kevin Ocaña", "role": "student"}', now(), now());
  END IF;

  -- 6. Crear a Tatiana Sanza (Estudiante)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'tatiana.sanza@preicfes.com') THEN
    uid := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
    VALUES (uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tatiana.sanza@preicfes.com', crypt('estudiante123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Tatiana Sanza", "role": "student"}', now(), now());
  END IF;

END $$;
