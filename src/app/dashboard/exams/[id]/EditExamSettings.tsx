'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateExamSettings } from './actions'

export default function EditExamSettings({ exam, onUpdated }: { exam: any, onUpdated?: () => void }) {
  const [isEditing, setIsEditing] = useState(false)
  
  if (!isEditing) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
        Editar Configuración
      </Button>
    )
  }

  // Manejar el tiempo en zona horaria de Bogotá (UTC-5)
  const getBogotaDateStr = (dateVal?: string) => {
    if (!dateVal) return ''
    const d = new Date(dateVal)
    const bogotaDate = new Date(d.toLocaleString('en-US', { timeZone: 'America/Bogota' }))
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${bogotaDate.getFullYear()}-${pad(bogotaDate.getMonth()+1)}-${pad(bogotaDate.getDate())}T${pad(bogotaDate.getHours())}:${pad(bogotaDate.getMinutes())}`
  }

  const initialDateStr = getBogotaDateStr(exam.due_date)
  const initialDate = initialDateStr.split('T')[0] || ''
  const initialTime = initialDateStr.split('T')[1] || ''
  const todayStr = getBogotaDateStr(new Date().toISOString()).split('T')[0]

  return (
    <form action={async (formData) => {
      const datePart = formData.get('due_date_date') as string
      const timePart = formData.get('due_date_time') as string
      formData.delete('due_date_date')
      formData.delete('due_date_time')
      
      if (datePart && timePart) {
        // Combinar fecha y hora para la DB forzando el huso horario de Colombia (UTC-5)
        formData.append('due_date', `${datePart}T${timePart}:00-05:00`)
      } else {
        formData.append('due_date', '')
      }

      await updateExamSettings(exam.id, formData)
      setIsEditing(false)
      if (onUpdated) onUpdated()
    }} className="mt-4 space-y-4 bg-background p-4 rounded-md border text-left">
      <div className="space-y-2">
        <Label>Título del Simulacro</Label>
        <Input name="title" defaultValue={exam.title} required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Duración (Minutos)</Label>
          <Input name="duration_minutes" type="number" defaultValue={exam.duration_minutes} required min={1} />
        </div>
        <div className="space-y-2">
          <Label>Cantidad de Preguntas</Label>
          <Input name="question_count" type="number" defaultValue={exam.question_count} required min={1} />
        </div>
        <div className="space-y-2">
          <Label>Fecha Límite</Label>
          <Input 
            name="due_date_date" 
            type="date" 
            min={todayStr}
            defaultValue={initialDate} 
            onClick={(e) => {
              try { (e.target as HTMLInputElement).showPicker() } catch (err) {}
            }}
          />
        </div>
        <div className="space-y-2">
          <Label>Hora Límite</Label>
          <Input 
            name="due_date_time" 
            type="time" 
            defaultValue={initialTime} 
            onClick={(e) => {
               try { (e.target as HTMLInputElement).showPicker() } catch (err) {}
            }}
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" type="button" onClick={() => setIsEditing(false)}>Cancelar</Button>
        <Button type="submit">Guardar Cambios</Button>
      </div>
    </form>
  )
}
