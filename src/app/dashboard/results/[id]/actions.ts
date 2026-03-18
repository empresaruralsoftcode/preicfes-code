'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitGrade(studentExamId: string, answerId: string, newScore: number) {
  const supabase = await createClient()

  await supabase.from('student_answers')
    .update({ score: newScore, is_graded: true })
    .eq('id', answerId)

  // Recalculate total score
  const { data: allAnswers } = await supabase
    .from('student_answers')
    .select('score')
    .eq('student_exam_id', studentExamId)

  const totalScore = allAnswers?.reduce((acc, curr) => acc + (curr.score || 0), 0) || 0

  await supabase.from('student_exams')
    .update({ score: totalScore })
    .eq('id', studentExamId)

  revalidatePath(`/dashboard/results/${studentExamId}`)
  revalidatePath('/dashboard/results')
}
