import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ExamRunner from './ExamRunner'

export default async function StudentExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check if student has already completed the exam
  const { data: previousAttempt } = await supabase
    .from('student_exams')
    .select('*')
    .eq('student_id', user.id)
    .eq('exam_id', id)
    .single()

  if (previousAttempt && previousAttempt.end_time) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Simulacro Completado</h2>
          <p className="text-muted-foreground mb-6">Tu puntaje preliminar ha sido registrado. Ingresa al panel interactivo para obtener más detalles.</p>
          <div className="bg-emerald-50 text-emerald-700 py-3 rounded-lg font-semibold text-lg border border-emerald-200">
             Puntaje: {previousAttempt.score ?? 'Por procesar'}
          </div>
          <a href="/dashboard" className="mt-8 inline-block px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition">
             Volver al Inicio
          </a>
        </div>
      </div>
    )
  }

  // Determine if there is an in-progress attempt, otherwise create one
  let studentExamId = previousAttempt?.id
  if (!previousAttempt) {
    const { data: newAttempt, error } = await supabase
      .from('student_exams')
      .insert([{ student_id: user.id, exam_id: id }])
      .select()
      .single()
      
    if (error || !newAttempt) return <div>Error creando intento del simulacro</div>
    studentExamId = newAttempt.id
  }

  // Fetch the exam header info
  const { data: exam } = await supabase
    .from('exams')
    .select('title, duration_minutes, due_date, components(name)')
    .eq('id', id)
    .single()

  // Fetch all questions & their options (scrambled or ordered)
  const { data: questions } = await supabase
    .from('questions')
    .select('id, statement, type, media_url, options(id, text)')
    .eq('exam_id', id)
    .order('created_at', { ascending: true })

  if (!exam || !questions) return <div>No se pudo cargar el simulacro</div>

  if (exam.due_date && new Date() > new Date(exam.due_date) && (!previousAttempt || !previousAttempt.end_time)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-gray-100">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Simulacro Cerrado</h2>
          <p className="text-muted-foreground mb-6">La fecha y hora límite para realizar este simulacro ({new Date(exam.due_date).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}) ha expirado.</p>
          <a href="/dashboard" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition">
             Volver al Inicio
          </a>
        </div>
      </div>
    )
  }

  const componentInfo = Array.isArray(exam.components) ? exam.components[0] : exam.components

  return (
    <div className="min-h-screen bg-slate-50/80 pb-12">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-4 md:px-8 py-3 flex justify-between items-center">
         <div>
            <h1 className="text-xl font-bold text-slate-900">{exam.title}</h1>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mt-0.5">{componentInfo?.name}</p>
         </div>
         {/* The client component will handle the countdown */}
         <div id="exam-timer-placeholder" className="bg-blue-50 text-blue-700 font-mono text-lg font-bold px-5 py-2 rounded-xl border border-blue-200 shadow-sm" />
      </div>

      <main className="max-w-4xl mx-auto mt-8 px-4">
        <ExamRunner 
          examId={id} 
          studentExamId={studentExamId} 
          durationMinutes={exam.duration_minutes} 
          questions={questions as any[]} 
          startTime={previousAttempt?.start_time || new Date().toISOString()}
        />
      </main>
    </div>
  )
}
