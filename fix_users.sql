DO $$ 
DECLARE 
  v_uid UUID;
BEGIN
  -- 1. Eliminar las cuentas mal creadas (si existen) para no causar conflictos de duplicado
  DELETE FROM auth.users WHERE email IN (
    'admin@preicfes.com', 
    'carlos.hurtado@preicfes.com', 
    'lina.vidal@preicfes.com', 
    'sebastian.ocana@preicfes.com', 
    'kevin.ocana@preicfes.com', 
    'tatiana.sanza@preicfes.com'
  );

  -- 2. RE-CREAR USUARIOS (AHORA DE FORMA OFICIAL INCLUYENDO LA IDENTIDAD PARA LOGIN)

  -- Administrador (admin123)
  v_uid := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
  VALUES (v_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@preicfes.com', crypt('admin123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Administrador Principal", "role": "admin"}', now(), now());
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_uid, v_uid::text, jsonb_build_object('sub', v_uid, 'email', 'admin@preicfes.com', 'email_verified', true), 'email', now(), now());

  -- Carlos Hurtado (docente123)
  v_uid := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
  VALUES (v_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'carlos.hurtado@preicfes.com', crypt('docente123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Carlos Hurtado", "role": "teacher"}', now(), now());
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_uid, v_uid::text, jsonb_build_object('sub', v_uid, 'email', 'carlos.hurtado@preicfes.com', 'email_verified', true), 'email', now(), now());

  -- Lina Vidal (docente123)
  v_uid := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
  VALUES (v_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lina.vidal@preicfes.com', crypt('docente123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Lina Vidal", "role": "teacher"}', now(), now());
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_uid, v_uid::text, jsonb_build_object('sub', v_uid, 'email', 'lina.vidal@preicfes.com', 'email_verified', true), 'email', now(), now());

  -- Sebastian Ocaña (estudiante123)
  v_uid := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
  VALUES (v_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sebastian.ocana@preicfes.com', crypt('estudiante123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Sebastian Ocaña", "role": "student"}', now(), now());
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_uid, v_uid::text, jsonb_build_object('sub', v_uid, 'email', 'sebastian.ocana@preicfes.com', 'email_verified', true), 'email', now(), now());

  -- Kevin Ocaña (estudiante123)
  v_uid := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
  VALUES (v_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kevin.ocana@preicfes.com', crypt('estudiante123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Kevin Ocaña", "role": "student"}', now(), now());
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_uid, v_uid::text, jsonb_build_object('sub', v_uid, 'email', 'kevin.ocana@preicfes.com', 'email_verified', true), 'email', now(), now());

  -- Tatiana Sanza (estudiante123)
  v_uid := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
  VALUES (v_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tatiana.sanza@preicfes.com', crypt('estudiante123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Tatiana Sanza", "role": "student"}', now(), now());
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_uid, v_uid::text, jsonb_build_object('sub', v_uid, 'email', 'tatiana.sanza@preicfes.com', 'email_verified', true), 'email', now(), now());

END $$;
