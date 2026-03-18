'use client'

import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { use } from 'react'
import Link from 'next/link'

export default function LoginPage({ searchParams }: { searchParams: Promise<{ error: string }> }) {
  const { error } = use(searchParams)

  return (
    <div className="flex min-h-screen">
      {/* Left side - decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 items-center justify-center p-12 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-indigo-300/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1.5s' }} />
        
        <div className="relative z-10 max-w-md text-white space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg>
            </div>
            <span className="text-2xl font-bold">PreICFES Pro</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight">
            Tu mejor herramienta para las pruebas Saber 11
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            Practica con simulacros diseñados por docentes, obtén retroalimentación instantánea y mejora tu puntaje paso a paso.
          </p>
          <div className="flex gap-6 pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold">100+</div>
              <div className="text-blue-200 text-sm">Preguntas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">4</div>
              <div className="text-blue-200 text-sm">Áreas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">PDF</div>
              <div className="text-blue-200 text-sm">Reportes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-slate-50/50">
        <div className="w-full max-w-sm space-y-8 animate-fade-in-up">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">PreICFES</span>
              <span className="text-2xl font-bold text-slate-800">Pro</span>
            </Link>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bienvenido de vuelta</h1>
            <p className="text-slate-500 text-sm">
              Ingresa tus credenciales para acceder a la plataforma.
            </p>
          </div>

          <form className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">Correo Electrónico</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="usuario@colegio.edu.co" 
                required 
                className="h-11 rounded-lg border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">Contraseña</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="h-11 rounded-lg border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
                <span>{error}</span>
              </div>
            )}

            <Button formAction={login} className="w-full h-11 rounded-lg font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all">
              Iniciar Sesión
            </Button>
          </form>
          
          <div className="text-center">
            <Link href="/" className="text-xs text-slate-400 hover:text-primary transition-colors">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
