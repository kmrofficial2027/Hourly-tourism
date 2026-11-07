import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const DEFAULT_SUPABASE_URL = 'https://isdtxdmwzkkjoxmizgje.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZHR4ZG13emtram94bWl6Z2plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3MDk5MjksImV4cCI6MjEwOTI4NTkyOX0.YeeoFi4fxJhrkYgaOkEYIldDryz_-FMFuqaulQKPHrU'
const DEFAULT_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZHR4ZG13emtram94bWl6Z2plIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzcwOTkyOSwiZXhwIjoyMTA5Mjg1OTI5fQ.bfrgLYrm-iA_DxTjPqP7t5ZiU8Hly3WRcee-6Fj60JQ'

// High-speed in-memory role cache to avoid repeat Supabase REST lookups across navigations (5 min TTL)
const roleCache = new Map<string, { role: string; ts: number }>()
const ROLE_CACHE_TTL = 5 * 60 * 1000

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // FAST PATH 1: API routes handle their own auth; skip middleware overhead completely
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // FAST PATH 2: Static assets, icons, fonts, and images
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js')
  ) {
    return NextResponse.next()
  }

  // 1. Canonicalize any Netlify preview hash deployments to the production domain
  const hostname = request.nextUrl.hostname
  if (
    hostname.endsWith('.netlify.app') &&
    hostname !== 'hourlytourism.netlify.app' &&
    !hostname.includes('localhost')
  ) {
    const canonicalUrl = new URL(
      pathname + request.nextUrl.search,
      'https://hourlytourism.netlify.app'
    )
    return NextResponse.redirect(canonicalUrl)
  }

  // 2. If an OAuth authorization code lands on ANY route:
  const code = request.nextUrl.searchParams.get('code')
  if (code && pathname !== '/auth/callback') {
    const callbackUrl = new URL('/auth/callback', request.url)
    request.nextUrl.searchParams.forEach((val, key) => {
      callbackUrl.searchParams.set(key, val)
    })
    return NextResponse.redirect(callbackUrl)
  }

  // 3. Let /auth/callback handle token exchange cleanly
  if (pathname === '/auth/callback') {
    return NextResponse.next()
  }

  // 4. Legacy redirect
  if (pathname.startsWith('/company')) {
    return NextResponse.redirect(new URL('/provider', request.url))
  }

  const isLoginPage = pathname === '/admin/login' || pathname === '/login'
  const isSignupPage = pathname === '/signup'
  const protectedPaths = ['/dashboard', '/provider', '/admin']
  const isProtectedRoute = protectedPaths.some((p) => pathname.startsWith(p)) && !isLoginPage

  // FAST PATH 3: Public pages (Homepage, Explore, Destinations, Terms, etc.)
  // Never make remote auth/database calls for public visitors!
  if (!isProtectedRoute && !isLoginPage && !isSignupPage) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const url = envUrl && !envUrl.includes('placeholder') ? envUrl : DEFAULT_SUPABASE_URL

  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const anonKey = envKey && !envKey.includes('placeholder') ? envKey : DEFAULT_SUPABASE_ANON_KEY

  const envServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const serviceKey =
    envServiceKey && !envServiceKey.includes('placeholder')
      ? envServiceKey
      : DEFAULT_SERVICE_ROLE_KEY

  try {
    const supabase = createServerClient(url, anonKey, {
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
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 1. Unauthenticated users trying to access protected portals -> redirect to login
    if (isProtectedRoute && !user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = pathname.startsWith('/admin') ? '/admin/login' : '/login'
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // 2. Resolve database role for authenticated user (use memory cache first)
    if (user) {
      let userRole: string | undefined
      const cached = roleCache.get(user.id)
      if (cached && Date.now() - cached.ts < ROLE_CACHE_TTL) {
        userRole = cached.role
      } else {
        userRole = (user?.user_metadata?.role as string) || (user?.app_metadata?.role as string)
      }

      // Only query Supabase REST if role is still unknown
      if (!userRole) {
        try {
          const res = await fetch(`${url}/rest/v1/profiles?id=eq.${user.id}&select=role`, {
            headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
          })
          const profData = await res.json()
          if (profData?.[0]?.role) {
            userRole = profData[0].role
          }

          if (userRole !== 'admin') {
            const provRes = await fetch(
              `${url}/rest/v1/provider_profiles?user_id=eq.${user.id}&select=id`,
              {
                headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
              }
            )
            const provData = await provRes.json()
            if (provData?.[0]?.id) {
              userRole = 'provider'
            }
          }
        } catch {}
      }

      if (userRole) {
        roleCache.set(user.id, { role: userRole, ts: Date.now() })
      }

      // Redirect if visiting login/signup while already authenticated
      if (isLoginPage || isSignupPage) {
        let dest = '/dashboard'
        if (userRole === 'admin') dest = '/admin'
        else if (userRole === 'provider') dest = '/provider'
        return NextResponse.redirect(new URL(dest, request.url))
      }

      // Role boundary auto-routing
      if (pathname.startsWith('/dashboard') && userRole === 'provider') {
        return NextResponse.redirect(new URL('/provider', request.url))
      }
      if (pathname.startsWith('/provider') && userRole === 'customer') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      if (pathname.startsWith('/admin') && pathname !== '/admin/login' && userRole !== 'admin') {
        let dest = userRole === 'provider' ? '/provider' : '/dashboard'
        return NextResponse.redirect(new URL(dest, request.url))
      }
    }
  } catch (e) {
    // Graceful fallback during static build or network outage
  }

  return supabaseResponse
}
