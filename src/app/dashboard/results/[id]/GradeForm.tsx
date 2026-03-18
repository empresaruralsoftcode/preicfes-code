'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { submitGrade } from './actions'

export function GradeForm({
  studentExamId,
  answerId,
  currentScore,
  maxPoints
}: {
  studentExamId: string
  answerId: string
  currentScore: number | null
  maxPoints: number
}) {
  const [score, setScore] = useState<number>(currentScore || 0)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await submitGrade(studentExamId, answerId, score)
    setIsSaving(false)
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <div className="flex items-center gap-3">
        <span className="font-semibold text-lg text-primary">{currentScore !== null ? currentScore : '-'} / {maxPoints} Puntos</span>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Calificar</Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={score}
        onChange={(e) => setScore(parseFloat(e.target.value) || 0)}
        min={0}
        max={maxPoints}
        step={0.1}
        className="w-24"
      />
      <span className="text-muted-foreground mr-2">/ {maxPoints}</span>
      <Button size="sm" onClick={handleSave} disabled={isSaving}>
        {isSaving ? '...' : 'Guardar'}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancelar</Button>
    </div>
  )
}
