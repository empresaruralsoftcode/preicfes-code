'use client'

import { useRouter } from 'next/navigation'
import React from 'react'

export function ResultRow({ res, children, className }: { res: any, children: React.ReactNode, className?: string }) {
  const router = useRouter()
  
  return (
    <tr 
      className={`${className} cursor-pointer`}
      onDoubleClick={() => {
        if (res.end_time) {
          router.push(`/dashboard/results/${res.id}`)
        } else {
          alert('El estudiante aún no ha terminado este simulacro.')
        }
      }}
      title={res.end_time ? "Doble clic para revisar" : "En progreso/Asignado"}
    >
      {children}
    </tr>
  )
}
