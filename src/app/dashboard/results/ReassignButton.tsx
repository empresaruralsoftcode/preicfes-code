'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { reassignExam } from '@/app/dashboard/exams/actions'
import { useRouter } from 'next/navigation'

export function ReassignButton({ studentExamId, studentName, examTitle }: { 
  studentExamId: string
  studentName: string
  examTitle: string 
}) {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleReassign = async () => {
    setLoading(true)
    setShowModal(false)
    await reassignExam(studentExamId)
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <Button 
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={(e) => {
          e.stopPropagation()
          setShowModal(true)
        }}
        className="text-xs gap-1.5 rounded-lg border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all"
        title="Reasignar simulacro para segundo intento"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
        </svg>
        {loading ? 'Reasignando...' : 'Reasignar'}
      </Button>

      <ConfirmModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleReassign}
        variant="info"
        title="Reasignar Simulacro"
        description={`¿Deseas permitir que "${studentName}" realice nuevamente el simulacro "${examTitle}"? Se eliminarán sus respuestas anteriores y podrá volver a intentarlo desde cero.`}
        confirmText="Sí, Reasignar"
        cancelText="No, Cancelar"
      />
    </>
  )
}
