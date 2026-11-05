import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const DEFAULT_SUPABASE_URL = 'https://isdtxdmwzkkjoxmizgje.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZHR4ZG13emtram94bWl6Z2plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3MDk5MjksImV4cCI6MjEwOTI4NTkyOX0.YeeoFi4fxJhrkYgaOkEYIldDryz_-FMFuqaulQKPHrU'
const DEFAULT_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZHR4ZG13emtram94bWl6Z2plIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzcwOTkyOSwiZXhwIjoyMTA5Mjg1OTI5fQ.bfrgLYrm-iA_DxTjPqP7t5ZiU8Hly3WRcee-6Fj60JQ'

export async function updateSession(request: NextRequest) {
  // 1. Canonicalize any Netlify preview hash deployments to the production domain
  const hostname = request.nextUrl.hostname
  if (
    hostname.endsWith('.netlify.app') &&
    hostname !== 'hourlytourism.netlify.app' &&
    !hostname.includes('localhost')
  ) {
    const canonicalUrl = new URL(
      request.nextUrl.pathname + request.nextUrl.search,
      'https://hourlytourism.netlify.app'
    )
    return NextResponse.redirect(canonicalUrl)
  }

  // 2. If an OAuth authorization code lands on ANY route (especially / fallback from Supabase Site URL):
  const code = request.nextUrl.searchParams.get('code')
  if (code && request.nextUrl.pathname !== '/auth/callback') {
    const callbackUrl = new URL('/auth/callback', request.url)
    request.nextUrl.searchParams.forEach((val, key) => {
      callbackUrl.searchParams.set(key, val)
    })
    return NextResponse.redirect(callbackUrl)
  }

  // 3. Let /auth/callback handle token exchange cleanly without middleware interception
  if (request.nextUrl.pathname === '/auth/callback') {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const url =
    envUrl && !envUrl.includes('placeholder') ? envUrl : DEFAULT_SUPABASE_URL

  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const anonKey =
    envKey && !envKey.includes('placeholder') ? envKey : DEFAULT_SUPABASE_ANON_KEY

  const envServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const serviceKey =
    envServiceKey && !envServiceKey.includes('placeholder')
      ? envServiceKey
      : DEFAULT_SERVICE_ROLE_KEY

  try {
    const supabase = createServerClient(
      url,
      anonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    const isLoginPage = request.nextUrl.pathname === '/admin/login' || request.nextUrl.pathname === '/login'
    const isSignupPage = request.nextUrl.pathname === '/signup'

    // If any legacy /company link is requested, redirect directly to /provider
    if (request.nextUrl.pathname.startsWith('/company')) {
      return NextResponse.redirect(new URL('/provider', request.url))
    }

    const protectedPaths = ['/dashboard', '/provider', '/admin']
    const isProtectedRoute = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path)) && !isLoginPage

    // 1. If unauthenticated user tries to access protected portal, redirect to login
    if (isProtectedRoute && !user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = request.nextUrl.pathname.startsWith('/admin') ? '/admin/login' : '/login'
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // 2. Resolve database role for authenticated user
    let userRole = (user?.user_metadata?.role as string) || (user?.app_metadata?.role as string)
    if (user) {
      try {
        const res = await fetch(`${url}/rest/v1/profiles?id=eq.${user.id}&select=role`, {
          headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
        })
        const profData = await res.json()
        if (profData?.[0]?.role) {
          userRole = profData[0].role
        }

        // If not already verified as admin, check if user is a registered provider
        if (userRole !== 'admin') {
          const provRes = await fetch(`${url}/rest/v1/provider_profiles?user_id=eq.${user.id}&select=id`, {
            headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
          })
          const provData = await provRes.json()
          if (provData?.[0]?.id) {
            userRole = 'provider'
          }
        }
      } catch { }
    }

    // 2. If already logged in and visits /login or /signup, auto-redirect to their exact dashboard
    if (user && (isLoginPage || isSignupPage) && request.nextUrl.pathname !== '/admin/login') {
      let dest = '/dashboard'
      if (userRole === 'admin') dest = '/admin'
      else if (userRole === 'provider') dest = '/provider'

      return NextResponse.redirect(new URL(dest, request.url))
    }

    // 3. Role-based portal protection and auto-routing for authenticated users
    if (user) {
      const isDashboardPath = request.nextUrl.pathname.startsWith('/dashboard')
      const isProviderPath = request.nextUrl.pathname.startsWith('/provider')
      const isAdminPath = request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login'

      // 3.1. Providers visiting customer portal (/dashboard) -> redirect to Provider Portal
      if (isDashboardPath && userRole === 'provider') {
        return NextResponse.redirect(new URL('/provider', request.url))
      }

      // 3.2. Customers visiting Provider portal -> redirect to Customer Dashboard
      if (isProviderPath && userRole === 'customer') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      // 3.3. Non-admins visiting Admin portal -> redirect to their own portal
      if (isAdminPath && userRole !== 'admin') {
        let dest = '/dashboard'
        if (userRole === 'provider') dest = '/provider'
        return NextResponse.redirect(new URL(dest, request.url))
      }
    }
  } catch (e) {
    // Graceful fallback during static build or network outage
  }

  return supabaseResponse
}
