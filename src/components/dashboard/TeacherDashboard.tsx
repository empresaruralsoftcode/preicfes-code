import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AssignExamModal } from './AssignExamModal'
import { DeleteExamButton } from './DeleteExamButton'
import { ToggleExamButton } from './ToggleExamButton'

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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Mis Simulacros</h2>
          <p className="text-slate-500 mt-1">
            Administra los bancos de preguntas y simulacros para tus áreas.
          </p>
        </div>
        <Button asChild className="rounded-lg shadow-md shadow-blue-500/15 hover:shadow-lg hover:shadow-blue-500/20 transition-all">
          <Link href="/dashboard/exams/new">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Crear Simulacro
          </Link>
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {exams && exams.length > 0 ? (
          exams.map((exam) => (
            <Card key={exam.id} className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 ${exam.is_draft ? 'opacity-80 border-dashed border-2 border-slate-300 hover:opacity-100' : !exam.is_active ? 'opacity-60 border-slate-200 grayscale-[30%] hover:opacity-80' : 'border-slate-200/80 hover:border-blue-200'}`}>
              {/* Top accent line */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${exam.is_draft ? 'bg-amber-400' : !exam.is_active ? 'bg-slate-300' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`} />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                      {exam.components?.name}
                    </span>
                    {exam.is_draft && (
                      <span className="bg-amber-50 text-amber-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-amber-200">Borrador</span>
                    )}
                    {!exam.is_draft && !exam.is_active && (
                      <span className="bg-slate-100 text-slate-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-slate-200">Deshabilitado</span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{exam.duration_minutes} min</span>
                </div>
                <CardTitle className="text-lg mt-3 text-slate-900 group-hover:text-blue-700 transition-colors">{exam.title}</CardTitle>
                <CardDescription className="text-slate-500">
                  {exam.question_count} preguntas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  {!exam.is_draft && <AssignExamModal examId={exam.id} examTitle={exam.title} />}
                  <Button variant={exam.is_draft ? 'default' : 'secondary'} className="w-full rounded-lg text-sm" asChild>
                    <Link href={`/dashboard/exams/${exam.id}`}>{exam.is_draft ? 'Continuar Creando' : 'Editar'}</Link>
                  </Button>
                  <form>
                    <DeleteExamButton onConfirmAction={async () => {
                      'use server'
                      const { deleteExam } = await import('@/app/dashboard/exams/actions')
                      await deleteExam(exam.id)
                    }} />
                  </form>
                </div>
                {!exam.is_draft && (
                  <div className="flex justify-center border-t border-slate-100 pt-2">
                    <ToggleExamButton 
                      examId={exam.id} 
                      isActive={exam.is_active ?? true}
                      onToggle={async (id: string, newState: boolean) => {
                        'use server'
                        const { toggleExamActive } = await import('@/app/dashboard/exams/actions')
                        await toggleExamActive(id, newState)
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
            <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
            <p className="font-medium text-slate-500">No has creado ningún simulacro aún.</p>
            <p className="text-sm mt-1">Haz clic en "Crear Simulacro" para comenzar.</p>
          </div>
        )}
      </div>
    </div>
  )
}
