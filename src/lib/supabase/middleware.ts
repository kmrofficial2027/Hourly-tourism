import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const DEFAULT_SUPABASE_URL = 'https://isdtxdmwzkkjoxmizgje.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZHR4ZG13emtram94bWl6Z2plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3MDk5MjksImV4cCI6MjEwOTI4NTkyOX0.YeeoFi4fxJhrkYgaOkEYIldDryz_-FMFuqaulQKPHrU'

export async function updateSession(request: NextRequest) {
  // If an OAuth authorization code lands on ANY route (especially / fallback from Supabase Site URL):
  const code = request.nextUrl.searchParams.get('code')
  if (code && request.nextUrl.pathname !== '/auth/callback') {
    const callbackUrl = new URL('https://hourlytourism.netlify.app/auth/callback')
    request.nextUrl.searchParams.forEach((val, key) => {
      callbackUrl.searchParams.set(key, val)
    })
    return NextResponse.redirect(callbackUrl)
  }

  let supabaseResponse = NextResponse.next({ request })

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const url =
    envUrl && !envUrl.includes('placeholder') ? envUrl : DEFAULT_SUPABASE_URL

  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const anonKey =
    envKey && !envKey.includes('placeholder') ? envKey : DEFAULT_SUPABASE_ANON_KEY

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

    // Protected routes (except /admin/login)
    const isLoginPage = request.nextUrl.pathname === '/admin/login' || request.nextUrl.pathname === '/login'
    const protectedPaths = ['/dashboard', '/provider', '/company', '/admin']
    const isProtectedRoute = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path)) && !isLoginPage

    if (isProtectedRoute && !user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = request.nextUrl.pathname.startsWith('/admin') ? '/admin/login' : '/login'
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Role-based route protection
    if (user) {
      // Fast path: inspect role in user JWT metadata without a database roundtrip
      let role = (user.user_metadata?.role as string) || (user.app_metadata?.role as string)

      if (!role) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        role = profile?.role
      }

      if (role) {
        if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login' && role !== 'admin') {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        if (request.nextUrl.pathname.startsWith('/provider') && !['provider', 'admin'].includes(role)) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        if (request.nextUrl.pathname.startsWith('/company') && !['company', 'admin'].includes(role)) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
    }
  } catch (e) {
    // Graceful fallback during static build or network outage
  }

  return supabaseResponse
}
