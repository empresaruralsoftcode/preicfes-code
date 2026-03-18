'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { updateQuestionData, addQuestion } from './actions'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'
import 'katex/dist/katex.min.css'

const ReactQuill = dynamic(async () => {
  if (typeof window !== 'undefined') {
    (window as any).katex = (await import('katex')).default
  }
  return import('react-quill-new')
}, { ssr: false, loading: () => <div className="animate-pulse h-32 bg-gray-100 rounded-md border" /> })

export default function QuestionForm({ 
  examId, 
  initialData, 
  defaultPoints = 10,
  onCancel 
}: { 
  examId: string, 
  initialData?: any, 
  defaultPoints?: number,
  onCancel?: () => void 
}) {
  const [type, setType] = useState<'single' | 'multiple' | 'open'>(initialData?.type || 'single')
  const [points, setPoints] = useState<number>(initialData?.points ?? defaultPoints)
  const [statement, setStatement] = useState(initialData?.statement || '')
  const [options, setOptions] = useState<{ id?: string, text: string; is_correct: boolean }[]>(
    initialData?.options?.length > 0 ? initialData.options : [
      { text: '', is_correct: true },
      { text: '', is_correct: false },
    ]
  )
  const [preserveMedia, setPreserveMedia] = useState(!!initialData?.media_url)

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'font': [] }, { 'size': [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'align': [] }],
      ['link', 'formula'],
      ['clean']
    ]
  }), [])

  const handleAddOption = () => setOptions([...options, { text: '', is_correct: false }])

  const updateOption = (index: number, field: 'text' | 'is_correct', value: string | boolean) => {
    const newOptions = [...options]
    if (field === 'is_correct' && type === 'single') {
        newOptions.forEach(opt => opt.is_correct = false)
    }
    // @ts-ignore
    newOptions[index][field] = value
    setOptions(newOptions)
  }

  return (
    <Card className="mt-6 border border-dashed shadow-none">
      <CardContent className="pt-6">
        <form action={async (formData) => {
          formData.append('type', type)
          formData.append('points', points.toString())
          formData.append('statement', statement)
          formData.append('options', JSON.stringify(options))
          formData.append('preserve_media', preserveMedia ? 'true' : 'false')
          
          if (!statement || statement.trim() === '' || statement === '<p><br></p>') {
            alert('El enunciado no puede estar vacío.')
            return
          }

          if (initialData) {
            await updateQuestionData(examId, initialData.id, formData)
            if (onCancel) onCancel()
          } else {
            await addQuestion(examId, formData)
            // Reset form
            setOptions([{ text: '', is_correct: true }, { text: '', is_correct: false }])
            setPoints(defaultPoints)
            setStatement('')
          }
        }} className="space-y-4">
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-2 flex-1">
              <Label>Tipo de Pregunta</Label>
              <div className="flex gap-4">
                 {['single', 'multiple', 'open'].map((t) => (
                   <label key={t} className="flex items-center gap-2 cursor-pointer">
                     <input type="radio" name="temp_type" checked={type === t} onChange={() => setType(t as any)} />
                     <span className="capitalize">{t === 'single' ? 'Única Respuesta' : t === 'multiple' ? 'Múltiple Respuesta' : 'Abierta'}</span>
                   </label>
                 ))}
              </div>
            </div>
            
            <div className="space-y-2 w-full sm:w-32">
              <Label htmlFor="points">Puntos</Label>
              <Input 
                id="points" 
                type="number" 
                step="0.01"
                min="0"
                value={points} 
                onChange={(e) => setPoints(parseFloat(e.target.value) || 0)} 
                required 
              />
            </div>
          </div>

          <div className="space-y-2 pb-14 min-h-[300px]">
             <Label>Enunciado / Pregunta</Label>
             <ReactQuill
               theme="snow"
               value={statement}
               onChange={setStatement}
               modules={modules}
               placeholder="Escribe la pregunta aquí..."
               className="h-44"
             />
          </div>

          <div className="space-y-2">
            <Label htmlFor="media">Subir Imagen (Opcional)</Label>
            <Input id="media" name="media" type="file" accept="image/*" onChange={() => setPreserveMedia(false)} />
            {preserveMedia && initialData?.media_url && (
              <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                <span>Ya hay una imagen subida.</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => setPreserveMedia(false)}>Quitar imagen</Button>
              </div>
            )}
          </div>

          {(type === 'single' || type === 'multiple') && (
            <div className="space-y-3 pt-4 border-t">
              <Label>Opciones de Respuesta</Label>
              {options.map((opt, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type={type === 'single' ? 'radio' : 'checkbox'}
                    name="is_correct_group"
                    checked={opt.is_correct}
                    onChange={(e) => updateOption(index, 'is_correct', e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <Input 
                    value={opt.text}
                    onChange={(e) => updateOption(index, 'text', e.target.value)}
                    placeholder={`Opción ${index + 1}`}
                    required 
                  />
                  {options.length > 2 && (
                    <Button type="button" variant="destructive" size="sm" onClick={() => setOptions(options.filter((_, i) => i !== index))}>
                      X
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="secondary" size="sm" onClick={handleAddOption}>
                + Agregar Opción
              </Button>
            </div>
          )}

          <div className="flex justify-end pt-4 gap-2">
            {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>}
            <Button type="submit">{initialData ? 'Actualizar Pregunta' : 'Guardar Pregunta'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
