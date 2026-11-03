import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: 'Hourly Tourism — Discover More. One Hour at a Time.',
  description:
    'Online tourism marketplace to discover and book bikes, cars, vans, local tour guides, sightseeing tours, and unique travel experiences by the hour.',
  keywords: [
    'hourly tourism',
    'hourly bike rental',
    'hourly car rental',
    'hourly van rental',
    'hourly tour guide',
    'hourly sightseeing',
    'hourly travel experiences',
  ],
  authors: [{ name: 'Hourly Tourism' }],
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-white text-gray-900 antialiased font-sans selection:bg-emerald-100 selection:text-emerald-900">
        <ToastProvider />
        {children}
      </body>
    </html>
  )
}
