'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { getStudentsForAssignment, assignExamToStudents } from '@/app/dashboard/exams/assignment-actions'
import { UserPlus } from 'lucide-react'

export function AssignExamModal({ examId, examTitle }: { examId: string, examTitle: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [students, setStudents] = useState<any[]>([])
  const [assignedIds, setAssignedIds] = useState<string[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleOpen = async (open: boolean) => {
    setIsOpen(open)
    if (open) {
      setIsLoading(true)
      const data = await getStudentsForAssignment(examId)
      setStudents(data.students)
      setAssignedIds(data.assignedStudentIds)
      setSelectedIds(data.assignedStudentIds)
      setIsLoading(false)
    }
  }

  const toggleStudent = (id: string, checked: boolean) => {
    if (checked) setSelectedIds(prev => [...prev, id])
    else setSelectedIds(prev => prev.filter(sId => sId !== id))
  }

  const handleSave = async () => {
    setIsSaving(true)
    await assignExamToStudents(examId, selectedIds)
    setIsSaving(false)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Asignar a Estudiantes">
          <UserPlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Asignar Simulacro</DialogTitle>
          <DialogDescription>
            Selecciona los estudiantes para asignar el simulacro: {examTitle}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center">Cargando estudiantes...</p>
          ) : students.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {students.map((student) => {
                const isAssigned = assignedIds.includes(student.id)
                const isSelected = selectedIds.includes(student.id)
                return (
                  <div key={student.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`student-${student.id}`}
                      checked={isSelected}
                      disabled={isAssigned} // Can't unassign easily through this yet
                      onCheckedChange={(checked: boolean) => toggleStudent(student.id, checked)}
                    />
                    <label
                      htmlFor={`student-${student.id}`}
                      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed ${isAssigned ? 'text-muted-foreground opacity-70' : ''}`}
                    >
                      {student.name} {isAssigned && '(Ya asignado)'}
                    </label>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No hay estudiantes registrados o disponibles.</p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? 'Asignando...' : 'Guardar Asignaciones'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
