'use client'

import React from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 text-[#ff7a00] mx-auto flex items-center justify-center font-bold text-2xl">
            !
          </div>
          <h2 className="text-xl font-black text-gray-900">
            Application Interrupted
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            The application experienced an unexpected state. Please refresh to resume your session smoothly.
          </p>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload()
              } else {
                reset()
              }
            }}
            className="w-full py-3 px-5 rounded-2xl bg-[#0a4d29] text-white font-bold text-sm shadow-lg shadow-green-900/20 active:scale-95 transition-transform"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  )
}

