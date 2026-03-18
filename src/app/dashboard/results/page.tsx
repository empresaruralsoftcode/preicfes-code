import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResultRow } from './ResultRow'

export default async function StudentResultsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'teacher') {
    redirect('/dashboard') // Solo docentes
  }

  // Obtenemos los intentos o asignaciones de los simulacros de este docente
  const { data: results, error } = await supabase
    .from('student_exams')
    .select(`
      id,
      start_time,
      end_time,
      score,
      profiles:student_id(name),
      exams!inner(title, teacher_id, question_count)
    `)
    .eq('exams.teacher_id', user.id)
    .order('start_time', { ascending: false, nullsFirst: true })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Resultados de Estudiantes</h2>
        <p className="text-muted-foreground">
          Visualiza el estado y puntaje de los simulacros asignados a los estudiantes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial y Asignaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Estudiante</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Simulacro</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Estado</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Puntaje</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Fecha Terminado</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {!results || results.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                      No hay datos de estudiantes asignados a tus simulacros.
                    </td>
                  </tr>
                ) : (
                  results.map((res: any) => {
                    const status = res.end_time ? 'Terminado' : (res.start_time ? 'En Progreso' : 'Asignado')
                    const dateStr = res.end_time ? new Date(res.end_time).toLocaleString('es-CO', { timeZone: 'America/Bogota' }) : '-'
                    const scoreDisplay = res.score !== null ? `${res.score} Puntos` : '-'
                    
                    return (
                      <ResultRow key={res.id} res={res} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle font-medium">{res.profiles?.name || 'Desconocido'}</td>
                        <td className="p-4 align-middle">{res.exams?.title || 'Simulacro Eliminado'}</td>
                        <td className="p-4 align-middle">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            status === 'Terminado' ? 'bg-emerald-100 text-emerald-800' :
                            status === 'En Progreso' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="p-4 align-middle">{scoreDisplay}</td>
                        <td className="p-4 align-middle">{dateStr}</td>
                      </ResultRow>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {results && results.length > 0 && (
        <p className="text-sm text-muted-foreground mt-4 italic">
          Tip: Haz doble clic sobre una fila con estado "Terminado" para revisar el examen y calificar respuestas.
        </p>
      )}
    </div>
  )
}
