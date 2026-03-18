'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=Credenciales incorrectas o usuario no encontrado')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function createAdminInitial(formData: FormData) {
  const supabase = await createClient()

  const email = (formData.get('email') as string).trim()
  const password = formData.get('password') as string
  
  if (email !== 'admin@preicfes.com') {
     redirect('/login?error=Solo el administrador principal puede registrarse desde aquí.')
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: 'Administrador', role: 'admin' } }
  })

  if (error) redirect('/login?error=Error creando admin: ' + error.message)
  redirect('/dashboard')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
