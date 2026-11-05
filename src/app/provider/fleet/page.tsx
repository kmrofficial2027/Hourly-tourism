'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProviderFleetPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/provider/verification')
  }, [router])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 animate-pulse">
        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      </div>
      <p className="text-sm font-bold text-gray-800">Redirecting to Verification & Compliance Hub...</p>
      <p className="text-xs text-gray-500 mt-1 max-w-md">
        Vehicle specs, registration documents, and driver licences are now managed and verified directly under the unified Verification tab.
      </p>
    </div>
  )
}
