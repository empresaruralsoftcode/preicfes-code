'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createUserByAdminAction } from './admin-actions'

export function CreateUserForm({ role, btnText, badgeText, colorSchema }: {
  role: 'student' | 'teacher'
  btnText: string
  badgeText: string
  colorSchema: 'indigo' | 'emerald'
}) {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await createUserByAdminAction(formData)
      if (res?.error) {
        setErrorMsg(res.error)
      } else {
        e.currentTarget.reset()
      }
    } catch (err: any) {
      setErrorMsg('Error general del servidor')
    } finally {
      setLoading(false)
    }
  }

  // Styles based on colorSchema
  const badgeClasses = colorSchema === 'indigo'
    ? 'text-indigo-600 bg-indigo-100/50'
    : 'text-emerald-700 bg-emerald-100/50'

  const inputClasses = colorSchema === 'indigo'
    ? 'focus:border-indigo-300'
    : 'focus:border-emerald-300'

  const btnClasses = colorSchema === 'indigo'
    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
    : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className={`text-[11px] font-bold uppercase tracking-widest inline-block px-3 py-1 rounded-full ${badgeClasses}`}>
        {badgeText}
      </h4>
      <input type="hidden" name="role" value={role} />
      
      <Input 
        name="name" 
        placeholder="Nombre completo" 
        required 
        disabled={loading}
        className={`bg-white/80 border-white/60 focus:bg-white transition-colors rounded-xl h-12 shadow-sm ${inputClasses}`} 
      />
      
      <div className="grid grid-cols-2 gap-3">
        <Input 
          name="email" 
          type="email" 
          placeholder="Correo electrónico" 
          required 
          disabled={loading}
          className={`bg-white/80 border-white/60 focus:bg-white transition-colors rounded-xl h-12 shadow-sm ${inputClasses}`} 
        />
        <Input 
          name="password" 
          type="text" 
          placeholder="Contraseña" 
          required 
          disabled={loading}
          className={`bg-white/80 border-white/60 focus:bg-white transition-colors rounded-xl h-12 shadow-sm ${inputClasses}`} 
        />
      </div>

      {errorMsg && (
        <p className="text-red-500 text-sm font-medium">{errorMsg}</p>
      )}

      <Button 
        type="submit" 
        disabled={loading}
        className={`w-full h-12 rounded-xl text-white font-bold shadow-lg transition-all mt-2 ${btnClasses}`}
      >
        {loading ? 'Creando...' : btnText}
      </Button>
    </form>
  )
}
