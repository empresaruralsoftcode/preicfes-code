'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

export function DeleteExamButton({ onConfirmAction }: { onConfirmAction: () => void }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Button 
        variant="destructive" 
        size="icon" 
        title="Eliminar Simulacro"
        className="rounded-lg hover:scale-105 transition-transform"
        onClick={() => setShowModal(true)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
        </svg>
      </Button>

      <ConfirmModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => {
          setShowModal(false)
          onConfirmAction()
        }}
        variant="danger"
        title="Eliminar Simulacro"
        description="¿Estás seguro de que deseas eliminar este simulacro por completo? Todas las preguntas, opciones y resultados asociados se perderán. Esta acción es irreversible."
        confirmText="Sí, Eliminar"
        cancelText="No, Cancelar"
      />
    </>
  )
}
