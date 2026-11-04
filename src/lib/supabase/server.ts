import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const DEFAULT_SUPABASE_URL = 'https://isdtxdmwzkkjoxmizgje.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZHR4ZG13emtram94bWl6Z2plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3MDk5MjksImV4cCI6MjEwOTI4NTkyOX0.YeeoFi4fxJhrkYgaOkEYIldDryz_-FMFuqaulQKPHrU'
const DEFAULT_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZHR4ZG13emtram94bWl6Z2plIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzcwOTkyOSwiZXhwIjoyMTA5Mjg1OTI5fQ.bfrgLYrm-iA_DxTjPqP7t5ZiU8Hly3WRcee-6Fj60JQ'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const url =
    envUrl && !envUrl.includes('placeholder') ? envUrl : DEFAULT_SUPABASE_URL

  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const anonKey =
    envKey && !envKey.includes('placeholder') ? envKey : DEFAULT_SUPABASE_ANON_KEY

  return createServerClient(
    url,
    anonKey,
    {
      cookieEncoding: 'raw',
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // This can be ignored in Server Components
          }
        },
      },
    }
  )
}

export async function createAdminSupabaseClient() {
  const { createClient } = await import('@supabase/supabase-js')
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const url =
    envUrl && !envUrl.includes('placeholder') ? envUrl : DEFAULT_SUPABASE_URL

  const envKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const serviceRoleKey =
    envKey && !envKey.includes('placeholder') ? envKey : DEFAULT_SERVICE_ROLE_KEY

  return createClient(
    url,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
