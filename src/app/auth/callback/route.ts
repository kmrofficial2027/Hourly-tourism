import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect')
  const role = searchParams.get('role') || 'customer'

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data?.user) {
      // Check if profile exists, if not create one
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          full_name:
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            data.user.email?.split('@')[0] ||
            'User',
          avatar_url:
            data.user.user_metadata?.avatar_url ||
            data.user.user_metadata?.picture ||
            '',
          role: role,
          is_active: true,
          email_verified: true,
          phone_verified: false,
        })
      }

      // Determine destination
      let targetPath = redirect
      if (!targetPath) {
        const userRole = existingProfile?.role || role
        if (userRole === 'admin') targetPath = '/admin'
        else if (userRole === 'provider') targetPath = '/provider'
        else if (userRole === 'company') targetPath = '/company'
        else targetPath = '/dashboard'
      }

      return NextResponse.redirect(`${origin}${targetPath}`)
    }
  }

  // Return to login with error parameter
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
}

