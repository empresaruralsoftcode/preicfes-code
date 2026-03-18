import { createClient } from '@/utils/supabase/server'
import { createExam } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function NewExamPage({ searchParams }: { searchParams: Promise<{ error: string }> }) {
  const { error: urlError } = await searchParams;
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch only components assigned to this teacher
  const { data: teacherComponents } = await supabase
    .from('teacher_components')
    .select('components(id, name)')
    .eq('teacher_id', user.id)

  const components = teacherComponents?.map(tc => tc.components).filter(Boolean) || []

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Crear Nuevo Simulacro</CardTitle>
          <CardDescription>
            Configura los detalles básicos de la prueba antes de agregar preguntas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createExam} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del Simulacro</Label>
              <Input id="title" name="title" required placeholder="Ej: Simulacro Matemáticas 2024" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="component_id">Componente (Área)</Label>
              <select
                id="component_id"
                name="component_id"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Selecciona un área</option>
                {components?.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duración (Minutos)</Label>
                <Input id="duration_minutes" name="duration_minutes" type="number" min="5" required placeholder="60" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="question_count">Número de Preguntas</Label>
                <Input id="question_count" name="question_count" type="number" min="1" required placeholder="10" />
              </div>
            </div>

            {urlError && (
              <p className="text-sm text-red-500">{urlError}</p>
            )}

            <div className="pt-4 flex justify-end">
               <Button type="submit">Continuar a Agregar Preguntas</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
