import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createAdminSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const searchParams = requestUrl.searchParams
  const code = searchParams.get('code')
  const redirectParam = searchParams.get('redirect')
  const roleParam = searchParams.get('role')
  const oauthError = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Dynamic origin matching the current browser request (canonicalize Netlify previews)
  let siteOrigin = requestUrl.origin
  if (siteOrigin.includes('.netlify.app')) {
    siteOrigin = 'https://hourlytourism.netlify.app'
  }

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

  const effectiveRole = roleParam || cookieRole || 'customer'
  const rawRedirect = searchParams.get('redirect') || cookieRedirect || redirectParam

  // Default target path
  let targetPath = '/dashboard'
  if (effectiveRole === 'admin') targetPath = '/admin'
  else if (effectiveRole === 'provider') targetPath = '/provider'
  else if (effectiveRole === 'company') targetPath = '/company'

  if (
    rawRedirect &&
    rawRedirect.startsWith('/') &&
    rawRedirect !== '/login' &&
    rawRedirect !== '/signup' &&
    rawRedirect !== '/null' &&
    rawRedirect !== '/undefined'
  ) {
    targetPath = rawRedirect
  }

  // Create initial redirect response so cookies can be set
  const response = NextResponse.redirect(`${siteOrigin}${targetPath}`)

  // Clean temporary auth cookies
  response.cookies.delete('ht_auth_role')
  response.cookies.delete('ht_auth_redirect')

  try {
    const supabase = createServerClient(url, anonKey, {
      cookieEncoding: 'raw',
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options)
            } catch {
              // Ignore in edge context
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
      try {
        const adminSupabase = await createAdminSupabaseClient()

        // 1. Fetch existing profile
        const { data: existingProfile } = await adminSupabase
          .from('profiles')
          .select('id, role')
          .eq('id', data.user.id)
          .maybeSingle()

        // 2. Fetch provider & company profiles
        const { data: provRow } = await adminSupabase
          .from('provider_profiles')
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle()

        const { data: compRow } = await adminSupabase
          .from('company_profiles')
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle()

        const userMeta = data.user.user_metadata || {}

        if (!existingProfile) {
          // Deduplicate: check if an existing profile exists with this email under a different id
          const { data: duplicateProfile } = await adminSupabase
            .from('profiles')
            .select('id, role')
            .ilike('email', data.user.email || '')
            .maybeSingle()

          if (duplicateProfile && duplicateProfile.role !== effectiveRole) {
            await supabase.auth.signOut()
            const portalName = duplicateProfile.role === 'customer' ? 'Tourist Portal' : `${duplicateProfile.role} Portal`
            return NextResponse.redirect(
              `${siteOrigin}/login?role=${effectiveRole}&error=${encodeURIComponent(
                `Account already exists in ${portalName}. Please sign in to the ${portalName} or create a new account with a different email for ${effectiveRole}.`
              )}`
            )
          }

          // Create exactly one profile for this user
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

          if (effectiveRole === 'provider') {
            await adminSupabase.from('provider_profiles').insert({
              user_id: data.user.id,
              verification_status: 'pending',
              business_name: userMeta.full_name || userMeta.name || 'Independent Host',
            })
          } else if (effectiveRole === 'company') {
            await adminSupabase.from('company_profiles').insert({
              user_id: data.user.id,
              company_name: userMeta.full_name || userMeta.name || 'Company Fleet',
              verification_status: 'approved',
            })
          }

          // Persist role into auth.users metadata
          await adminSupabase.auth.admin.updateUserById(data.user.id, {
            user_metadata: { ...userMeta, role: effectiveRole },
          })
        } else {
          // Existing user login: STRICT ROLE ISOLATION
          const realRole = existingProfile.role

          // Admin has universal portal clearance
          if (realRole !== 'admin') {
            if (realRole === 'customer' && effectiveRole !== 'customer') {
              await supabase.auth.signOut()
              return NextResponse.redirect(
                `${siteOrigin}/login?role=${effectiveRole}&error=${encodeURIComponent(
                  'Account already exists in Tourist Portal. Please sign in to the Tourist Portal or create a new account with a different email for Provider.'
                )}`
              )
            }

            if (realRole === 'provider' && effectiveRole !== 'provider') {
              await supabase.auth.signOut()
              return NextResponse.redirect(
                `${siteOrigin}/login?role=${effectiveRole}&error=${encodeURIComponent(
                  'This account is registered as a Provider. Please switch to the Provider Portal tab to sign in, or create a separate account.'
                )}`
              )
            }

            if (realRole === 'company' && effectiveRole !== 'company') {
              await supabase.auth.signOut()
              return NextResponse.redirect(
                `${siteOrigin}/login?role=${effectiveRole}&error=${encodeURIComponent(
                  'This account is registered as a Company Operator. Please switch to the Company Portal tab to sign in, or create a separate account.'
                )}`
              )
            }
          }

          // Sync into user_metadata
          await adminSupabase.auth.admin.updateUserById(data.user.id, {
            user_metadata: { ...userMeta, role: realRole },
          })

          // Update destination if no explicit deep link was specified
          if (!rawRedirect || rawRedirect === '/' || rawRedirect === '/dashboard') {
            if (realRole === 'admin') targetPath = '/admin'
            else if (realRole === 'provider') targetPath = '/provider'
            else if (realRole === 'company') targetPath = '/company'
            else targetPath = '/dashboard'

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
