import { createClient } from '@/utils/supabase/server'
import QuestionForm from './QuestionForm'
import EditableQuestionCard from './EditableQuestionCard'
import EditExamSettings from './EditExamSettings'
import { publishExam } from './actions'
import { Button } from '@/components/ui/button'

export default async function ExamDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: exam } = await supabase
    .from('exams')
    .select('*, components(name)')
    .eq('id', id)
    .single()

  const { data: questions } = await supabase
    .from('questions')
    .select('*, options(*)')
    .eq('exam_id', id)
    .order('created_at', { ascending: true })

  if (!exam) return <div>Examen no encontrado</div>

  const isComplete = questions && questions.length >= exam.question_count

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {exam.is_draft && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md flex justify-between items-center">
          <div>
            <strong className="font-bold">Modo Edición: </strong>
            <span className="block sm:inline">Este simulacro aún no se ha guardado de forma definitiva ni es visible para asignación.</span>
          </div>
        </div>
      )}

      <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
        <div className="flex justify-between items-start">
          <h2 className="text-3xl font-bold tracking-tight mb-2">{exam.title}</h2>
          <EditExamSettings exam={exam} />
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground mt-2 flex-wrap items-center">
          <span className="font-semibold text-primary">{exam.components?.name}</span>
          <span>•</span>
          <span>{exam.duration_minutes} Minutos</span>
          <span>•</span>
          <span>{questions?.length || 0} / {exam.question_count} Preguntas añadidas</span>
          {exam.due_date && (
            <>
              <span>•</span>
              <span className="text-red-600 font-medium">Límite: {new Date(exam.due_date).toLocaleString()}</span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {questions && questions.map((q, idx) => (
          <EditableQuestionCard key={q.id} q={q} examId={exam.id} idx={idx} />
        ))}
      </div>

      {!isComplete ? (
        <QuestionForm examId={exam.id} defaultPoints={exam.question_count > 0 ? parseFloat((100 / exam.question_count).toFixed(2)) : 10} />
      ) : (
        <div className="p-6 text-center bg-emerald-50 text-emerald-700 font-semibold rounded-lg border border-emerald-200">
          Has añadido todas las preguntas ({exam.question_count}) especificadas para este simulacro.
        </div>
      )}

      {exam.is_draft && (
        <div className="pt-8 pb-12 flex justify-center border-t mt-8">
          <form action={async () => {
            'use server';
            await publishExam(exam.id)
          }}>
            <Button size="lg" type="submit" className="text-lg px-8 py-6 h-auto w-full sm:w-auto shadow-lg hover:shadow-xl transition-all">
              Finalizar y Guardar Simulacro
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
