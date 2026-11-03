import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder_key'

  // If running with placeholder credentials during build, skip remote network calls
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    return supabaseResponse
  }

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

    // Protected routes
    const protectedPaths = ['/dashboard', '/provider', '/company', '/admin']
    const isProtectedRoute = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

    if (isProtectedRoute && !user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Role-based route protection
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile) {
        if (request.nextUrl.pathname.startsWith('/admin') && profile.role !== 'admin') {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        if (request.nextUrl.pathname.startsWith('/provider') && !['provider', 'admin'].includes(profile.role)) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        if (request.nextUrl.pathname.startsWith('/company') && !['company', 'admin'].includes(profile.role)) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
    }
  } catch (e) {
    // Graceful fallback during static build or network outage
  }

  return supabaseResponse
}
