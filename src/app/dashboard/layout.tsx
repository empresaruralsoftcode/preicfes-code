import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { signout } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { TeacherSidebar } from '@/components/dashboard/TeacherSidebar'
import Link from 'next/link'

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

  const roleLabel = profile?.role === 'admin' ? 'Administrador' : profile?.role === 'teacher' ? 'Docente' : 'Estudiante'
  const roleColor = profile?.role === 'admin' ? 'bg-violet-500/10 text-violet-700 border-violet-200' : profile?.role === 'teacher' ? 'bg-blue-500/10 text-blue-700 border-blue-200' : 'bg-emerald-500/10 text-emerald-700 border-emerald-200'

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl px-4 md:px-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold">
          <span className="text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">PreICFES</span>
          <span className="text-lg text-slate-800">Pro</span>
        </Link>
        <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${roleColor}`}>
          {roleLabel}
        </span>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium text-slate-700">{profile?.name}</span>
          </div>
          <form action={signout}>
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors text-xs font-medium">
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
              Salir
            </Button>
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
