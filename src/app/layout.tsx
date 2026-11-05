import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/ui/Toast'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'Hourly Tourism — Discover More. One Hour at a Time.',
  description:
    'Online tourism marketplace to discover and book rider-hosted bike tours, chauffeured car trips, van group tours, local guides, sightseeing circuits, and unique travel experiences by the hour in Coimbatore and beyond.',
  keywords: [
    'hourly tourism',
    'hourly bike tour',
    'hourly car tour with chauffeur',
    'hourly tourist ride',
    'rider hosted tourism',
    'coimbatore tourism',
    'western ghats tour',
    'isha adiyogi tour',
    'siruvani waterfalls',
    'valparai tour',
    'hourly travel experiences',
  ],
  authors: [{ name: 'Hourly Tourism' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Hourly Tourism — Discover More. One Hour at a Time.',
    description:
      'Book bikes, cars & vans by the hour. Explore Coimbatore, Western Ghats, Isha Adiyogi & more.',
    url: '/',
    siteName: 'Hourly Tourism',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Hourly Tourism — Discover More. One Hour at a Time.',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hourly Tourism — Discover More. One Hour at a Time.',
    description: 'Book bikes, cars & vans by the hour. Explore Coimbatore & Western Ghats.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
  manifest: '/manifest.json',
  other: {
    'theme-color': '#16a34a',
    'msapplication-TileColor': '#16a34a',
    'msapplication-TileImage': '/icon-192.png',
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
