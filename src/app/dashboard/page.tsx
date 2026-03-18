import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import TeacherDashboard from '@/components/dashboard/TeacherDashboard'
import StudentDashboard from '@/components/dashboard/StudentDashboard'
import AdminDashboard from '@/components/dashboard/AdminDashboard'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') {
    return <AdminDashboard userId={user.id} />
  }

  if (profile?.role === 'teacher') {
    return <TeacherDashboard userId={user.id} />
  }

  return <StudentDashboard userId={user.id} />
}
