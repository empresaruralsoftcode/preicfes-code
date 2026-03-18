'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteExam(examId: string) {
  const supabase = await createClient()
  await supabase.from('exams').delete().eq('id', examId)
  revalidatePath('/dashboard')
}
