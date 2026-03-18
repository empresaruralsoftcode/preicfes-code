'use client'

import { login, createAdminInitial } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { use } from 'react'

export default function LoginPage({ searchParams }: { searchParams: Promise<{ error: string }> }) {
  const { error } = use(searchParams)

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm shadow-lg border-t-4 border-t-primary">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">PreICFES Pro</CardTitle>
          <CardDescription className="text-center">
            Ingresa los datos proporcionados por tu administrador para acceder a la plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" name="email" type="email" placeholder="usuario@colegio.edu.co" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" required />
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center bg-red-50 p-2 rounded">{error}</p>
            )}

            <div className="pt-4 flex gap-2">
              <Button formAction={login} className="w-full shadow-md font-semibold text-md">
                Iniciar Sesión
              </Button>
            </div>
            <div className="text-center pt-2">
               <p className="text-xs text-muted-foreground">Si eres el administrador y aún no tienes cuenta, crea tu usuario raíz aquí:</p>
               <Button formAction={createAdminInitial} variant="link" className="text-xs">
                 Crear cuenta Admin Inicial
               </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
