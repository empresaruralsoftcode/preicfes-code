'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { deleteQuestion } from './actions'
import QuestionForm from './QuestionForm'
import 'katex/dist/katex.min.css'
import 'react-quill-new/dist/quill.snow.css'

export default function EditableQuestionCard({ q, examId, idx }: { q: any, examId: string, idx: number }) {
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    return <QuestionForm examId={examId} initialData={q} onCancel={() => setIsEditing(false)} />
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
           <CardTitle className="text-lg">Pregunta {idx + 1}</CardTitle>
           <div className="flex gap-2">
             <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Editar</Button>
             <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={async () => {
                if(confirm('¿Seguro que deseas eliminar esta pregunta?')) {
                  await deleteQuestion(examId, q.id)
                }
             }}>Eliminar</Button>
           </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground uppercase">
          <span>{q.type === 'open' ? 'Abierta' : q.type === 'single' ? 'Única Respuesta' : 'Múltiple Respuesta'}</span>
          <span>•</span>
          <span className="font-semibold text-primary">{q.points || 10} Puntos</span>
        </div>
      </CardHeader>
      <CardContent className="pt-4 overflow-hidden">
        <div className="ql-snow">
          <div className="ql-editor prose max-w-none text-sm break-words p-0" dangerouslySetInnerHTML={{ __html: q.statement }} />
        </div>
        
        {q.media_url && (
          <div className="mt-4">
            <img src={q.media_url} alt="Question Media" className="max-h-64 rounded-md border" />
          </div>
        )}

        {q.options && q.options.length > 0 && (
          <ul className="mt-4 space-y-2">
            {q.options.map((opt: any) => (
              <li key={opt.id} className={`p-2 rounded-md text-sm border ${opt.is_correct ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-muted/50 border-input'}`}>
                {opt.text} {opt.is_correct && <span className="float-right font-bold focus:outline-none">✓ Correcta</span>}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
