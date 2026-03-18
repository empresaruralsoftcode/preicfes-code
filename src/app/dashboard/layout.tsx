import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { signout } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { TeacherSidebar } from '@/components/dashboard/TeacherSidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile to get the role
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 shadow-sm md:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <span className="text-xl text-primary">PreICFES Pro</span>
          {profile?.role === 'admin' && (
            <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-900 dark:text-violet-300">
              Admin
            </span>
          )}
          {profile?.role === 'teacher' && (
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              Docente
            </span>
          )}
          {profile?.role === 'student' && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
              Estudiante
            </span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm font-medium hidden sm:inline-block">Hola, {profile?.name}</span>
          <form action={signout}>
            <Button variant="outline" size="sm">Cerrar Sesión</Button>
          </form>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {profile?.role === 'teacher' && (
          <div className="hidden md:flex">
             <TeacherSidebar />
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
