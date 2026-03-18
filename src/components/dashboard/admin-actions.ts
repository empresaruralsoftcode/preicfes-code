'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteUserAction(formData: FormData) {
  const targetUserId = formData.get('userId') as string
  const supabase = await createClient()
  
  const { error } = await supabase.rpc('delete_user', { target_user_id: targetUserId })
  
  if (error) {
     console.error('Error deleting user:', error)
     throw new Error('Error al eliminar usuario')
  }

  revalidatePath('/dashboard')
}

export async function assignComponentAction(formData: FormData) {
  const teacherId = formData.get('teacherId') as string
  const componentId = formData.get('componentId') as string
  
  const supabase = await createClient()
  await supabase.from('teacher_components').insert([{ teacher_id: teacherId, component_id: componentId }])
  
  revalidatePath('/dashboard')
}

export async function removeComponentAction(formData: FormData) {
  const teacherId = formData.get('teacherId') as string
  const componentId = formData.get('componentId') as string
  
  const supabase = await createClient()
  await supabase.from('teacher_components').delete().eq('teacher_id', teacherId).eq('component_id', componentId)
  
  revalidatePath('/dashboard')
}

export async function createUserByAdminAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const role = formData.get('role') as string // 'student' | 'teacher'
  
  const supabase = await createClient()
  const { error } = await supabase.rpc('create_user_by_admin', {
     new_email: email,
     new_password: password,
     new_name: name,
     new_role: role
  })

  if (error) {
     console.error('Error creating user by admin:', error)
     throw new Error('Error al crear usuario. Revisa si el correo ya existe.')
  }
  
  revalidatePath('/dashboard')
}
