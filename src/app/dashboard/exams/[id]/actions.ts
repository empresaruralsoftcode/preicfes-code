'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function publishExam(examId: string) {
  const supabase = await createClient()
  await supabase.from('exams').update({ is_draft: false }).eq('id', examId)
  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function addQuestion(examId: string, formData: FormData) {
  const supabase = await createClient()

  const statement = formData.get('statement') as string
  const type = formData.get('type') as 'single' | 'multiple' | 'open'
  const points = parseFloat(formData.get('points') as string) || 10
  const file = formData.get('media') as File | null

  let media_url = null

  // File Upload Logic
  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `questions/${examId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('exam-media')
      .upload(filePath, file)

    if (!uploadError) {
      const { data } = supabase.storage.from('exam-media').getPublicUrl(filePath)
      media_url = data.publicUrl
    }
  }

  // Insert Question
  const { data: question, error: qError } = await supabase
    .from('questions')
    .insert([{ exam_id: examId, statement, type, media_url, points }])
    .select()
    .single()

  if (qError || !question) throw new Error('Could not add question')

  // Parse Options for single/multiple choice
  if (type === 'single' || type === 'multiple') {
    const rawOptions = formData.get('options') as string
    if (rawOptions) {
      const options = JSON.parse(rawOptions) as {text: string, is_correct: boolean}[]
      if (options.length > 0) {
        const optionsData = options.map(opt => ({
          question_id: question.id,
          text: opt.text,
          is_correct: opt.is_correct
        }))
        await supabase.from('options').insert(optionsData)
      }
    }
  }

  revalidatePath(`/dashboard/exams/${examId}`)
}

export async function deleteQuestion(examId: string, questionId: string) {
  const supabase = await createClient()
  await supabase.from('questions').delete().eq('id', questionId)
  revalidatePath(`/dashboard/exams/${examId}`)
}

export async function updateExamSettings(examId: string, formData: FormData) {
  const supabase = await createClient()
  const title = formData.get('title') as string
  const duration_minutes = parseInt(formData.get('duration_minutes') as string, 10)
  const question_count = parseInt(formData.get('question_count') as string, 10)
  const due_date = formData.get('due_date') as string

  const updateData: any = { title, duration_minutes, question_count }
  if (due_date) {
    updateData.due_date = new Date(due_date).toISOString()
  } else {
    updateData.due_date = null
  }

  await supabase
    .from('exams')
    .update(updateData)
    .eq('id', examId)

  revalidatePath(`/dashboard/exams/${examId}`)
  revalidatePath('/dashboard')
}

export async function updateQuestionData(examId: string, questionId: string, formData: FormData) {
  const supabase = await createClient()

  const statement = formData.get('statement') as string
  const type = formData.get('type') as 'single' | 'multiple' | 'open'
  const points = parseFloat(formData.get('points') as string) || 10
  const file = formData.get('media') as File | null
  const preserveMedia = formData.get('preserve_media') === 'true'

  let media_url = null

  // File Upload Logic
  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `questions/${examId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('exam-media')
      .upload(filePath, file)

    if (!uploadError) {
      const { data } = supabase.storage.from('exam-media').getPublicUrl(filePath)
      media_url = data.publicUrl
    }
  } else if (preserveMedia) {
    // leave existing media_url intact
  }

  const updatePayload: any = { statement, type, points }
  if (media_url) {
    updatePayload.media_url = media_url
  } else if (!preserveMedia) {
    updatePayload.media_url = null
  }

  // Update Question
  await supabase.from('questions').update(updatePayload).eq('id', questionId)

  // Parse Options
  if (type === 'single' || type === 'multiple') {
    const rawOptions = formData.get('options') as string
    if (rawOptions) {
      const options = JSON.parse(rawOptions) as {text: string, is_correct: boolean}[]
      
      // Delete existing options
      await supabase.from('options').delete().eq('question_id', questionId)

      // Insert new options
      if (options.length > 0) {
        const optionsData = options.map(opt => ({
          question_id: questionId,
          text: opt.text,
          is_correct: opt.is_correct
        }))
        await supabase.from('options').insert(optionsData)
      }
    }
  } else {
    // If changed to open, delete existing options
    await supabase.from('options').delete().eq('question_id', questionId)
  }

  revalidatePath(`/dashboard/exams/${examId}`)
}
