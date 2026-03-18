'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getStudentsForAssignment(examId: string) {
  const supabase = await createClient()

  // Find all students
  const { data: students } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('role', 'student')

  // Find students who are already assigned to this exam
  const { data: assignments } = await supabase
    .from('student_exams')
    .select('student_id')
    .eq('exam_id', examId)

  const assignedStudentIds = assignments?.map((a) => a.student_id) || []

  return { students: students || [], assignedStudentIds }
}

export async function assignExamToStudents(examId: string, studentIds: string[]) {
  const supabase = await createClient()

  const { data: existingAssignments } = await supabase
    .from('student_exams')
    .select('student_id')
    .eq('exam_id', examId)

  const existingIds = existingAssignments?.map((a) => a.student_id) || []
  const newAssignments = studentIds
    .filter((id) => !existingIds.includes(id))
    .map((id) => ({
      exam_id: examId,
      student_id: id,
      start_time: null // explicitly un-started
    }))

  if (newAssignments.length > 0) {
    await supabase.from('student_exams').insert(newAssignments)
  }

  revalidatePath('/dashboard')
}
