'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { submitExam } from './actions'
import { Input } from '@/components/ui/input'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import 'katex/dist/katex.min.css'
import 'react-quill-new/dist/quill.snow.css'

type Question = {
  id: string
  statement: string
  type: 'single' | 'multiple' | 'open'
  media_url?: string
  options?: { id: string; text: string }[]
}

export default function ExamRunner({ 
  examId, 
  studentExamId, 
  durationMinutes, 
  questions,
  startTime
}: { 
  examId: string
  studentExamId: string
  durationMinutes: number
  questions: Question[]
  startTime: string
}) {
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60)
  const [isInitializing, setIsInitializing] = useState(true)
  const [showFinishModal, setShowFinishModal] = useState(false)
  const answersRef = useRef(answers)
  const draftKey = `draft_exam_${studentExamId}`

  // Ensure refs are updated correctly for setInterval closures
  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  // Load state from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(draftKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.answers) setAnswers(parsed.answers)
        if (typeof parsed.timeRemaining === 'number') {
           setTimeRemaining(parsed.timeRemaining)
        }
      } catch (e) {
         console.error('Error parsing draft state', e)
      }
    } else {
      // First time opening the exam: Set based on start time difference
      const elapsedSeconds = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000)
      const initialTime = Math.max((durationMinutes * 60) - elapsedSeconds, 0)
      setTimeRemaining(initialTime)
    }
    setIsInitializing(false)
  }, [draftKey, startTime, durationMinutes])

  // Timer rendering via Portal trick
  useEffect(() => {
    if (isInitializing) return
    const el = document.getElementById('exam-timer-placeholder')
    if (el) {
       const m = Math.floor(timeRemaining / 60).toString().padStart(2, '0')
       const s = (timeRemaining % 60).toString().padStart(2, '0')
       el.innerText = `${m}:${s}`
       if (timeRemaining < 300) {
          el.className = 'bg-red-50 text-red-700 font-mono text-lg font-bold px-4 py-1.5 rounded border border-red-500 animate-pulse'
       }
    }
  }, [timeRemaining, isInitializing])

  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = () => {
     if (formRef.current) {
        formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
     }
  }

  // Tick timer and auto-save
  useEffect(() => {
    if (isInitializing) return
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const nextTime = Math.max(prev - 1, 0)
        
        // Auto-save logic every second to LocalStorage
        localStorage.setItem(draftKey, JSON.stringify({
          answers: answersRef.current,
          timeRemaining: nextTime
        }))

        // Auto submit if time runs out
        if (nextTime <= 0) {
           clearInterval(interval)
           localStorage.removeItem(draftKey)
           handleSubmit() 
           return 0
        }
        return nextTime
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [draftKey, isInitializing])

  const handleOptionSelect = (qId: string, optId: string, type: 'single' | 'multiple') => {
    setAnswers((prev) => {
      if (type === 'single') return { ...prev, [qId]: [optId] }
      
      const existing = prev[qId] || []
      const updated = existing.includes(optId) 
          ? existing.filter((id: string) => id !== optId) 
          : [...existing, optId]
      return { ...prev, [qId]: updated }
    })
  }

  const handleOpenAnswer = (qId: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [`${qId}_text`]: text }))
  }

  if (isInitializing) return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando simulacro y borrador...</div>

  return (
    <form ref={formRef} action={async (formData) => {
       formData.append('studentExamId', studentExamId)
       Object.entries(answers).forEach(([key, val]) => {
          if (Array.isArray(val)) {
             formData.append(`q_${key}`, JSON.stringify(val))
          } else {
             formData.append(key, val)
          }
       })
       // Final Cleanup
       localStorage.removeItem(draftKey)
       await submitExam(formData)
    }} className="space-y-8">
      
      {questions.map((q, i) => (
        <Card key={q.id} className="shadow-sm">
           <div className="p-4 border-b bg-muted/20 font-semibold text-muted-foreground text-sm">
             Pregunta {i + 1} de {questions.length}
           </div>
           <CardContent className="pt-6 space-y-4 overflow-hidden">
             <div className="ql-snow">
               <div className="ql-editor p-0 text-lg font-medium prose max-w-none break-words" dangerouslySetInnerHTML={{ __html: q.statement }} />
             </div>
             
             {q.media_url && (
               <div className="py-2">
                 <img src={q.media_url} alt="Imagen de apoyo" className="rounded border max-w-full max-h-80 object-contain shadow-sm" />
               </div>
             )}

             <div className="pt-4 space-y-3">
               {q.type === 'open' ? (
                 <div className="space-y-4">
                   <textarea
                     className="w-full rounded-md border border-input p-3 min-h-32 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                     placeholder="Ingresa tu respuesta o argumentación aquí..."
                     value={answers[`${q.id}_text`] || ''}
                     onChange={(e) => handleOpenAnswer(q.id, e.target.value)}
                   />
                   <div>
                     <Label className="text-sm text-muted-foreground block mb-2">Adjuntar archivo de soporte (PDF/Imagen)</Label>
                     <Input type="file" name={`file_${q.id}`} accept="image/*,.pdf" className="w-full sm:w-1/2" />
                   </div>
                 </div>
               ) : (
                 <div className="space-y-2">
                   {q.options?.map((opt) => (
                      <label key={opt.id} className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                         (answers[q.id] || []).includes(opt.id) 
                         ? 'border-primary bg-primary/5 ring-1 ring-primary focus:outline-none' 
                         : 'hover:bg-muted/30 border-gray-200'
                      }`}>
                         <div className="mt-0.5">
                            <input 
                              type={q.type === 'single' ? 'radio' : 'checkbox'} 
                              name={`radio_${q.id}`} 
                              checked={(answers[q.id] || []).includes(opt.id)}
                              onChange={() => handleOptionSelect(q.id, opt.id, q.type as 'single' | 'multiple')}
                              className="w-5 h-5 accent-primary cursor-pointer"
                            />
                         </div>
                         <span className="text-base text-gray-800 flex-1 leading-relaxed">{opt.text}</span>
                      </label>
                   ))}
                 </div>
               )}
             </div>
           </CardContent>
        </Card>
      ))}

      <div className="p-6 bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-slate-200/60 flex flex-col sm:flex-row gap-4 justify-between items-center sticky bottom-6">
        <p className="text-sm text-slate-500">
          Asegúrate de haber respondido todas las preguntas antes de finalizar.
        </p>
        <Button 
           type="button" 
           size="lg" 
           className="px-8 font-semibold text-base rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:scale-[1.02]"
           onClick={() => setShowFinishModal(true)}
        >
           Finalizar y Enviar
        </Button>
      </div>

      <ConfirmModal
        open={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        onConfirm={() => {
          setShowFinishModal(false)
          handleSubmit()
        }}
        variant="warning"
        title="Finalizar Simulacro"
        description="¿Estás seguro de que deseas finalizar y enviar todas tus respuestas? Una vez enviadas no podrás modificarlas. Las preguntas sin responder se marcarán como incorrectas."
        confirmText="Sí, Finalizar y Enviar"
        cancelText="Seguir Respondiendo"
      />

    </form>
  )
}
