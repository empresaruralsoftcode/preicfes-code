'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteExam(examId: string) {
  const supabase = await createClient()
  await supabase.from('exams').delete().eq('id', examId)
  revalidatePath('/dashboard')
}

export async function reassignExam(studentExamId: string) {
  const supabase = await createClient()

  // Verificar que el intento existe y está finalizado
  const { data: studentExam } = await supabase
    .from('student_exams')
    .select('id, end_time')
    .eq('id', studentExamId)
    .single()

  if (!studentExam || !studentExam.end_time) return

  // Eliminar las respuestas del intento anterior
  await supabase
    .from('student_answers')
    .delete()
    .eq('student_exam_id', studentExamId)

  // Resetear el intento: limpiar score, end_time y start_time para que pueda volver a intentar
  await supabase
    .from('student_exams')
    .update({
      score: null,
      end_time: null,
      start_time: new Date().toISOString(),
    })
    .eq('id', studentExamId)

  revalidatePath('/dashboard/results')
}

export async function toggleExamActive(examId: string, isActive: boolean) {
  const supabase = await createClient()
  await supabase
    .from('exams')
    .update({ is_active: isActive })
    .eq('id', examId)
  revalidatePath('/dashboard')
}
