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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Simulacros Disponibles</h2>
        <p className="text-muted-foreground">
          Selecciona un simulacro para comenzar tu prueba.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {exams && exams.map((exam) => {
          const attempt = getAttempt(exam.id);
          const isCompleted = attempt && attempt.end_time;

          return (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {exam.components?.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{exam.duration_minutes} min</span>
                </div>
                <CardTitle className="text-xl mt-2">{exam.title}</CardTitle>
                <CardDescription>
                  {exam.question_count} preguntas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isCompleted ? (
                   <div className="flex items-center justify-between text-sm font-medium text-emerald-600 bg-emerald-50 rounded-md p-2">
                     <span>Completado</span>
                     <span>Puntaje: {attempt.score || 'Pendiente'}</span>
                   </div>
                ) : attempt ? (
                   <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white" asChild>
                     <Link href={`/exams/${exam.id}`}>Continuar Prueba</Link>
                   </Button>
                ) : (
                  <Button className="w-full" asChild>
                    <Link href={`/exams/${exam.id}`}>Comenzar Prueba</Link>
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
