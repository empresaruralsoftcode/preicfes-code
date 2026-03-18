import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { GradeForm } from './GradeForm'
import { ArrowLeft } from 'lucide-react'
import { PrintButton } from './PrintButton'
import 'katex/dist/katex.min.css'
import 'react-quill-new/dist/quill.snow.css'

export default async function ExamRevisionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'teacher') redirect('/dashboard')

  // Obtener detalles del intento (student_exams)
  const { data: rawStudentExam, error } = await supabase
    .from('student_exams')
    .select(`
      id,
      score,
      start_time,
      end_time,
      profiles:student_id(name),
      exams(id, title, duration_minutes, question_count, teacher_id)
    `)
    .eq('id', id)
    .single()

  const studentExam = rawStudentExam as any
  const examInfo = Array.isArray(studentExam?.exams) ? studentExam.exams[0] : studentExam?.exams
  const profileInfo = Array.isArray(studentExam?.profiles) ? studentExam.profiles[0] : studentExam?.profiles

  if (!studentExam || examInfo?.teacher_id !== user.id) {
    return <div>Examen o intento no encontrado.</div>
  }

  // Obtener preguntas y opciones del simulacro original
  const { data: examQuestions } = await supabase
    .from('questions')
    .select('id, statement, type, media_url, points, options(*)')
    .eq('exam_id', examInfo.id)
    .order('created_at', { ascending: true })

  // Obtener respuestas del estudiante
  const { data: studentAnswers } = await supabase
    .from('student_answers')
    .select('*')
    .eq('student_exam_id', id)

  // Calcular puntaje total posible
  const totalPossiblePoints = examQuestions?.reduce((acc, q) => acc + (q.points || 10), 0) || 0

  // Calcular resumen de cerradas
  const closedQuestions = examQuestions?.filter(q => q.type === 'single' || q.type === 'multiple') || []
  const correctCount = closedQuestions.reduce((acc, q) => {
     const answer = studentAnswers?.find(a => a.question_id === q.id)
     const maxPts = q.points || 10
     return acc + (answer?.score === maxPts ? 1 : 0)
  }, 0)
  const incorrectCount = closedQuestions.length - correctCount

  return (
    <div className="max-w-4xl mx-auto print:m-0 print:max-w-full">
      <div id="pdf-content-wrapper" className="space-y-6 bg-white relative p-1 sm:p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors print:hidden">
            <ArrowLeft className="w-4 h-4" />
            <Link href="/dashboard/results" className="text-sm font-medium">Volver a Resultados</Link>
          </div>
          <PrintButton 
            studentName={profileInfo?.name || 'Estudiante'} 
            examTitle={examInfo.title || 'Simulacro'} 
          />
        </div>
      
      <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-1">{examInfo.title}</h2>
            <p className="text-muted-foreground font-medium text-lg">Estudiante: {profileInfo?.name}</p>
          </div>
          <div className="text-right">
             <div className="bg-white px-4 py-2 rounded-md shadow-sm border font-bold text-2xl text-primary">
               {studentExam.score !== null ? studentExam.score : 0} / {totalPossiblePoints} <span className="text-sm">Pts</span>
             </div>
             <p className="text-xs text-muted-foreground mt-2">
               {studentExam.end_time ? 'Terminado el: ' + new Date(studentExam.end_time).toLocaleString('es-CO', { timeZone: 'America/Bogota' }) : 'En Progreso o Asignado'}
             </p>
             {closedQuestions.length > 0 && (
               <div className="flex justify-end gap-3 mt-3 text-sm">
                 <div className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">{correctCount} Correctas</div>
                 <div className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-medium">{incorrectCount} Incorrectas</div>
               </div>
             )}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Tabla para preguntas cerradas (Única / Múltiple) */}
        {(() => {
          const closedQuestions = examQuestions?.filter(q => q.type === 'single' || q.type === 'multiple') || []
          if (closedQuestions.length === 0) return null

          const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

          return (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b pb-2">Preguntas de Selección</h3>
              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Pregunta</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground text-center">Respuesta Estudiante</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground text-center">Respuesta Correcta</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground text-right">Puntaje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {closedQuestions.map((q, idx) => {
                       const answer = studentAnswers?.find(a => a.question_id === q.id)
                       const maxPoints = q.points || 10
                       const score = answer?.score || 0
                       
                       const isCorrect = score === maxPoints
                       const rowClass = answer ? (isCorrect ? 'bg-emerald-50/30' : 'bg-red-50/30') : ''

                       // Mapear opciones a letras A,B,C,D
                       const correctIndices = q.options?.map((opt: any, i: number) => opt.is_correct ? i : -1).filter((i: number) => i !== -1) || []
                       const correctLetters = correctIndices.map((i: number) => letters[i]).join(', ')

                       const selectedIndices = q.options?.map((opt: any, i: number) => answer?.selected_option_ids?.includes(opt.id) ? i : -1).filter((i: number) => i !== -1) || []
                       const selectedLetters = selectedIndices.map((i: number) => letters[i]).join(', ') || '-'

                       return (
                         <tr key={q.id} className={`${rowClass} hover:bg-muted/50 transition-colors`}>
                            <td className="px-4 py-3 font-medium">#{examQuestions!.findIndex(eq => eq.id === q.id) + 1}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-block px-2.5 py-1 rounded-md font-bold ${
                                answer ? (isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800') : 'text-muted-foreground'
                              }`}>
                                {selectedLetters}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-block px-2.5 py-1 rounded-md font-bold bg-gray-100 text-gray-800 border">
                                {correctLetters}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold">
                               <span className={isCorrect ? "text-emerald-600" : "text-red-500"}>{score}</span>
                               <span className="text-muted-foreground font-normal"> / {maxPoints}</span>
                            </td>
                         </tr>
                       )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })()}

        {/* Tarjetas para preguntas abiertas (Open) */}
        {(() => {
          const openQuestions = examQuestions?.filter(q => q.type === 'open') || []
          if (openQuestions.length === 0) return null

          return (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b pb-2">Preguntas Abiertas</h3>
              {openQuestions.map((q) => {
                const answer = studentAnswers?.find(a => a.question_id === q.id)
                const maxPoints = q.points || 10
                const globalIdx = examQuestions!.findIndex(eq => eq.id === q.id) + 1
                
                let correctnessClass = 'border-gray-200 bg-white'
                if (answer && answer.is_graded) {
                   correctnessClass = 'border-blue-400 bg-blue-50/50'
                }

                return (
                  <Card key={q.id} className={`${correctnessClass} shadow-sm transition-colors overflow-hidden`}>
                    <CardHeader className="pb-3 border-b bg-white/50">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Pregunta {globalIdx}</CardTitle>
                        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                           Abierta
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4 overflow-hidden">
                      <div className="flex gap-4 flex-col sm:flex-row">
                         <div className="flex-1 space-y-4">
                            <div className="ql-snow">
                              <div className="ql-editor p-0 prose max-w-none font-medium leading-relaxed text-sm break-words" dangerouslySetInnerHTML={{ __html: q.statement }} />
                            </div>
                            {q.media_url && (
                              <div className="mt-2 py-2">
                                <img src={q.media_url} alt="Media de la pregunta" className="max-h-56 rounded-md border shadow-sm" />
                              </div>
                            )}

                            {/* Respuesta Abierta Textual */}
                            {answer && answer.answer_text && (
                              <div className="bg-white p-4 rounded-md border text-sm mt-4">
                                <span className="font-semibold block mb-2 text-gray-700">Respuesta del Estudiante:</span>
                                <p className="whitespace-pre-wrap text-gray-600 italic">"{answer.answer_text}"</p>
                              </div>
                            )}

                            {/* Respuesta Abierta Archivo */}
                            {answer && answer.media_url && (
                              <div className="bg-white p-4 rounded-md border text-sm mt-4">
                                <span className="font-semibold block mb-2 text-gray-700">Archivo Adjunto:</span>
                                <a href={answer.media_url} target="_blank" className="text-blue-500 hover:underline">Ver Archivo Subido</a>
                              </div>
                            )}
                            
                            {!answer && <div className="text-muted-foreground mt-4 italic text-sm">El estudiante no respondió esta pregunta.</div>}
                         </div>

                         {/* Panel de Calificación Lateral */}
                         <div className="w-full sm:w-48 shrink-0 flex flex-col justify-start items-end sm:border-l sm:border-t-0 border-t pt-4 sm:pt-0 pl-0 sm:pl-4 bg-white/50 p-2 sm:rounded-r-md">
                            <span className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wide">Puntaje</span>
                            <div className="mt-1">
                              {(answer && studentExam.end_time) ? (
                                <div className="flex flex-col items-end">
                                  <div className="print:hidden">
                                     <GradeForm 
                                       studentExamId={studentExam.id} 
                                       answerId={answer.id} 
                                       currentScore={answer.score} 
                                       maxPoints={maxPoints} 
                                     />
                                  </div>
                                  <div className="hidden print:block text-lg font-bold text-primary">
                                     {answer.score} / {maxPoints}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center text-xs text-muted-foreground font-medium p-2 bg-gray-100 rounded-md">
                                  Pendiente entrega
                                </div>
                              )}
                            </div>
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )
        })()}
      </div>
      </div>
    </div>
  )
}
