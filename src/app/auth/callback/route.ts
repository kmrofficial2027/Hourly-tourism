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

  // Determine site canonical origin safely
  const forwardedHost = request.headers.get('x-forwarded-host')
  const hostHeader = request.headers.get('host') || ''

  let siteOrigin = 'https://hourlytourism.netlify.app'
  if (process.env.NODE_ENV === 'development' || hostHeader.includes('localhost')) {
    siteOrigin = 'http://localhost:3000'
  } else if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')) {
    siteOrigin = process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  } else if (forwardedHost && !forwardedHost.includes('master--')) {
    siteOrigin = `https://${forwardedHost}`
  } else if (hostHeader && !hostHeader.includes('master--')) {
    siteOrigin = `https://${hostHeader}`
  }

  // Handle incoming OAuth errors directly from Google/Supabase
  if (oauthError || errorDescription) {
    const errorMsg = errorDescription || oauthError || 'oauth_failed'
    return NextResponse.redirect(`${siteOrigin}/login?error=${encodeURIComponent(errorMsg)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${siteOrigin}/login?error=missing_code`)
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

  // Prepare destination
  let targetPath = '/dashboard'
  if (role === 'admin') targetPath = '/admin'
  else if (role === 'provider') targetPath = '/provider'
  else if (role === 'company') targetPath = '/company'

  if (
    redirectParam &&
    redirectParam.startsWith('/') &&
    redirectParam !== '/login' &&
    redirectParam !== '/null' &&
    redirectParam !== '/undefined'
  ) {
    targetPath = redirectParam
  }

  // Create redirect response upfront so cookies can be attached to it
  const response = NextResponse.redirect(`${siteOrigin}${targetPath}`)

  try {
    const cookieStore = await cookies()
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
            role: role,
            is_active: true,
            email_verified: true,
            phone_verified: false,
          })
        } else if (existingProfile.role) {
          // Adjust destination based on actual database role if no specific deep link was requested
          if (!redirectParam || redirectParam === '/') {
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


