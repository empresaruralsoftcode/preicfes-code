import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function StudentDashboard({ userId }: { userId: string }) {
  const supabase = await createClient()

  // Fetch available exams
  const { data: exams } = await supabase
    .from('exams')
    .select('*, components(name)')
    .order('created_at', { ascending: false })

  // Fetch student's past attempts
  const { data: attempts } = await supabase
    .from('student_exams')
    .select('exam_id, score, start_time, end_time')
    .eq('student_id', userId)

  const getAttempt = (examId: string) => attempts?.find(a => a.exam_id === examId)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Simulacros Disponibles</h2>
        <p className="text-slate-500 mt-1">
          Selecciona un simulacro para comenzar tu prueba.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {exams && exams.map((exam) => {
          const attempt = getAttempt(exam.id);
          const isCompleted = attempt && attempt.end_time;
          const isInProgress = attempt && !attempt.end_time;

          return (
            <Card key={exam.id} className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg ${isCompleted ? 'border-emerald-200/80 hover:border-emerald-300' : 'border-slate-200/80 hover:border-blue-200'}`}>
              {/* Top accent */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${isCompleted ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : isInProgress ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`} />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                    {exam.components?.name}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                    <span className="font-medium">{exam.duration_minutes} min</span>
                  </div>
                </div>
                <CardTitle className="text-lg mt-3 text-slate-900 group-hover:text-blue-700 transition-colors">{exam.title}</CardTitle>
                <CardDescription className="text-slate-500">
                  {exam.question_count} preguntas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isCompleted ? (
                   <div className="flex items-center justify-between text-sm font-semibold bg-emerald-50 rounded-xl p-3.5 border border-emerald-100">
                     <div className="flex items-center gap-2 text-emerald-700">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                       Completado
                     </div>
                     <span className="text-emerald-800">{attempt.score || 'Pendiente'} pts</span>
                   </div>
                ) : isInProgress ? (
                   <Button className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/15 transition-all" asChild>
                     <Link href={`/exams/${exam.id}`}>
                       <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>
                       Continuar Prueba
                     </Link>
                   </Button>
                ) : (
                  <Button className="w-full rounded-xl shadow-md shadow-blue-500/15 hover:shadow-lg hover:shadow-blue-500/20 transition-all" asChild>
                    <Link href={`/exams/${exam.id}`}>
                      Comenzar Prueba →
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
