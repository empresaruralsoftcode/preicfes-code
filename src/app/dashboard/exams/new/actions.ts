'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createExam(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const title = formData.get('title') as string
  const component_id = formData.get('component_id') as string
  const duration_minutes = parseInt(formData.get('duration_minutes') as string, 10)
  const question_count = parseInt(formData.get('question_count') as string, 10)

  const { data, error } = await supabase
    .from('exams')
    .insert([
      {
        title,
        component_id,
        duration_minutes,
        question_count,
        teacher_id: user.id
      }
    ])
    .select()
    .single()

  if (error || !data) {
    redirect('/dashboard/exams/new?error=Could not create exam')
  }

  redirect(`/dashboard/exams/${data.id}`)
}
