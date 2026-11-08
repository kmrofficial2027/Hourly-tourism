'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw, Home, Compass } from 'lucide-react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error for diagnostics
    console.error('Hourly Tourism Client Error Boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 text-center space-y-6">
        {/* Brand Icon Badge */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500/10 to-orange-500/20 text-[#ff7a00] mx-auto flex items-center justify-center shadow-inner">
          <AlertCircle className="w-10 h-10 text-[#ff7a00]" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Something went wrong
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            We encountered a temporary bump while loading this page. Your account, bookings, and active trips are completely safe.
          </p>
        </div>

        {/* Error Digest (if available) */}
        {error?.digest && (
          <div className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-[10px] text-gray-400 font-mono">
            Error ID: {error.digest}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#0a4d29] to-emerald-700 hover:from-emerald-800 hover:to-emerald-900 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload()
              }
            }}
            className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#ff7a00] to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Full Reload
          </button>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#0a4d29] hover:underline"
          >
            <Home className="w-3.5 h-3.5" />
            Return to Hourly Tourism Home
          </Link>
        </div>
      </div>
    </div>
  )
}

