import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AssignExamModal } from './AssignExamModal'

export default async function TeacherDashboard({ userId }: { userId: string }) {
  const supabase = await createClient()

  // Fetch teacher's components (subjects)
  const { data: teacherComponents } = await supabase
    .from('teacher_components')
    .select('components(id, name)')
    .eq('teacher_id', userId)

  // Fetch exams created by this teacher
  const { data: exams } = await supabase
    .from('exams')
    .select('*, components(name)')
    .eq('teacher_id', userId)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mis Simulacros</h2>
          <p className="text-muted-foreground">
            Administra los bancos de preguntas y simulacros para tus áreas.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/exams/new">Crear Simulacro</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {exams && exams.length > 0 ? (
          exams.map((exam) => (
            <Card key={exam.id} className={`transition-shadow ${exam.is_draft ? 'opacity-70 border-dashed border-2 hover:opacity-100' : 'hover:shadow-md'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      {exam.components?.name}
                    </span>
                    {exam.is_draft && (
                      <span className="bg-yellow-100 text-yellow-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Borrador</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{exam.duration_minutes} min</span>
                </div>
                <CardTitle className="text-xl mt-2">{exam.title}</CardTitle>
                <CardDescription>
                  {exam.question_count} preguntas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {!exam.is_draft && <AssignExamModal examId={exam.id} examTitle={exam.title} />}
                  <Button variant={exam.is_draft ? 'default' : 'secondary'} className="w-full" asChild>
                    <Link href={`/dashboard/exams/${exam.id}`}>{exam.is_draft ? 'Continuar Creando' : 'Editar'}</Link>
                  </Button>
                  <form action={async () => {
                      'use server'
                      const { deleteExam } = await import('@/app/dashboard/exams/actions')
                      await deleteExam(exam.id)
                    }}>
                    <Button type="submit" variant="destructive" size="icon" title="Eliminar Simulacro">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
            No has creado ningún simulacro aún.
          </div>
        )}
      </div>
    </div>
  )
}
