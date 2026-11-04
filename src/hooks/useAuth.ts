'use client'

import { useContext } from 'react'
import { useAuthContext, AuthProvider } from '@/contexts/AuthContext'

export { AuthProvider }

export function useAuth() {
  return useAuthContext()
}
