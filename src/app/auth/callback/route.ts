import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createAdminSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const searchParams = requestUrl.searchParams
  const code = searchParams.get('code')
  const redirectParam = searchParams.get('redirect')
  const role = searchParams.get('role') || 'customer'
  const oauthError = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Always redirect to the canonical Netlify production domain
  const siteOrigin = 'https://hourlytourism.netlify.app'

  // Handle incoming OAuth errors directly from Google/Supabase
  if (oauthError || errorDescription) {
    const errorMsg = errorDescription || oauthError || 'oauth_failed'
    return NextResponse.redirect(`${siteOrigin}/login?error=${encodeURIComponent(errorMsg)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${siteOrigin}/login?error=missing_code`)
  }

  const DEFAULT_SUPABASE_URL = 'https://isdtxdmwzkkjoxmizgje.supabase.co'
  const DEFAULT_SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZHR4ZG13emtram94bWl6Z2plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3MDk5MjksImV4cCI6MjEwOTI4NTkyOX0.YeeoFi4fxJhrkYgaOkEYIldDryz_-FMFuqaulQKPHrU'

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const url = envUrl && !envUrl.includes('placeholder') ? envUrl : DEFAULT_SUPABASE_URL

  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const anonKey = envKey && !envKey.includes('placeholder') ? envKey : DEFAULT_SUPABASE_ANON_KEY

  const cookieStore = await cookies()
  const cookieRole = cookieStore.get('ht_auth_role')?.value
  const cookieRedirect = cookieStore.get('ht_auth_redirect')?.value

  const effectiveRole = searchParams.get('role') || cookieRole || role || 'customer'
  const rawRedirect = searchParams.get('redirect') || cookieRedirect || redirectParam

  // Prepare destination
  let targetPath = '/dashboard'
  if (effectiveRole === 'admin') targetPath = '/admin'
  else if (effectiveRole === 'provider') targetPath = '/provider'
  else if (effectiveRole === 'company') targetPath = '/company'

  if (
    rawRedirect &&
    rawRedirect.startsWith('/') &&
    rawRedirect !== '/login' &&
    rawRedirect !== '/null' &&
    rawRedirect !== '/undefined'
  ) {
    targetPath = rawRedirect
  }

  // Create redirect response upfront so cookies can be attached to it
  const response = NextResponse.redirect(`${siteOrigin}${targetPath}`)

  // Clean temporary auth cookies
  response.cookies.delete('ht_auth_role')
  response.cookies.delete('ht_auth_redirect')

  try {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options)
            } catch {
              // Ignore in edge/server component context
            }
            response.cookies.set(name, value, options)
          })
        },
      },
    })

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('OAuth exchangeCodeForSession error:', exchangeError)
      return NextResponse.redirect(
        `${siteOrigin}/login?error=${encodeURIComponent(exchangeError.message || 'exchange_failed')}`
      )
    }

    if (data?.user) {
      // Check or create profile using admin client to bypass any RLS policy issues
      try {
        const adminSupabase = await createAdminSupabaseClient()
        const { data: existingProfile } = await adminSupabase
          .from('profiles')
          .select('id, role')
          .eq('id', data.user.id)
          .single()

        if (!existingProfile) {
          const userMeta = data.user.user_metadata || {}
          await adminSupabase.from('profiles').insert({
            id: data.user.id,
            email: data.user.email,
            full_name:
              userMeta.full_name ||
              userMeta.name ||
              data.user.email?.split('@')[0] ||
              'User',
            avatar_url: userMeta.avatar_url || userMeta.picture || '',
            role: effectiveRole,
            is_active: true,
            email_verified: true,
            phone_verified: false,
          })
        } else if (existingProfile.role) {
          // Adjust destination based on actual database role if no specific deep link was requested
          if (!rawRedirect || rawRedirect === '/') {
            if (existingProfile.role === 'admin') targetPath = '/admin'
            else if (existingProfile.role === 'provider') targetPath = '/provider'
            else if (existingProfile.role === 'company') targetPath = '/company'
            else targetPath = '/dashboard'

            // Update Location header on the response
            response.headers.set('Location', `${siteOrigin}${targetPath}`)
          }
        }
      } catch (profileErr) {
        console.error('Error syncing user profile after OAuth:', profileErr)
      }

      return response
    }
  } catch (err: any) {
    console.error('Callback exception:', err)
    return NextResponse.redirect(
      `${siteOrigin}/login?error=${encodeURIComponent(err?.message || 'callback_exception')}`
    )
  }

  return NextResponse.redirect(`${siteOrigin}/login?error=session_not_created`)
}


