'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function submitExam(formData: FormData) {
  const supabase = await createClient()
  const studentExamId = formData.get('studentExamId') as string

  // Get the exam questions to autograde multiple choice
  const { data: studentExam } = await supabase
    .from('student_exams')
    .select('exam_id')
    .eq('id', studentExamId)
    .single()

  if (!studentExam) redirect('/dashboard')

  const { data: questions } = await supabase
    .from('questions')
    .select('id, type, points, options(id, is_correct)')
    .eq('exam_id', studentExam.exam_id)

  let totalScore = 0
  const answerInserts = []

  for (const q of (questions || [])) {
    let mediaUrl = null

    // Upload file if any
    const file = formData.get(`file_${q.id}`) as File
    if (file && file.size > 0) {
       const ext = file.name.split('.').pop()
       const fileName = `${Math.random()}.${ext}`
       const path = `answers/${studentExamId}/${q.id}_${fileName}`
       await supabase.storage.from('exam-media').upload(path, file)
       const { data } = supabase.storage.from('exam-media').getPublicUrl(path)
       mediaUrl = data.publicUrl
    }

    if (q.type === 'single' || q.type === 'multiple') {
       const rawSelections = formData.get(`q_${q.id}`) as string
       let selectedOptionIds: string[] = []
       
       if (rawSelections) {
         try {
           selectedOptionIds = JSON.parse(rawSelections)
         } catch {}
       }

       // grade
       const correctOpts = q.options.filter((o: any) => o.is_correct).map((o: any) => o.id)
       const isCorrect = correctOpts.length === selectedOptionIds.length && 
                         correctOpts.every((id: string) => selectedOptionIds.includes(id))
       
       const pointsAwarded = isCorrect ? (q.points || 10) : 0
       totalScore += pointsAwarded

       answerInserts.push({
         student_exam_id: studentExamId,
         question_id: q.id,
         selected_option_ids: selectedOptionIds,
         score: pointsAwarded,
         is_graded: true
       })
    } else {
       // open question
       const textAnswer = formData.get(`${q.id}_text`) as string
       answerInserts.push({
         student_exam_id: studentExamId,
         question_id: q.id,
         answer_text: textAnswer,
         media_url: mediaUrl,
         score: 0,
         is_graded: false
       })
    }
  }

  // Insert Answers
  if (answerInserts.length > 0) {
    await supabase.from('student_answers').insert(answerInserts)
  }

  // Update Exam with initial score
  await supabase
    .from('student_exams')
    .update({ 
       end_time: new Date().toISOString(),
       score: totalScore
    })
    .eq('id', studentExamId)

  redirect(`/exams/${studentExam.exam_id}`) // redirect back to page to show completed screen
}
