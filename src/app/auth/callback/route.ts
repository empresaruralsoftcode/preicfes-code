import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && user) {
      // Check for temp_role to force the proper role upon first OAuth login
      const cookieStore = await cookies()
      const intendedRole = cookieStore.get('temp_role')?.value
      
      if (intendedRole && (intendedRole === 'student' || intendedRole === 'teacher')) {
        await supabase.from('profiles').update({ role: intendedRole }).eq('id', user.id)
        cookieStore.delete('temp_role')
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not login with Google`)
}
