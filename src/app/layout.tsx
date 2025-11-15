import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@/styles/z-index.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL('https://worldping.app'),
  title: {
    default: 'WorldPing - Drop Messages Anywhere on Earth',
    template: '%s | WorldPing'
  },
  description: 'Tap any location on the globe and leave a message, ask a question, or discover what people are saying right now. Real-time global conversation map.',
  keywords: ['global chat', 'location-based messaging', 'world map chat', 'geolocation app', 'anonymous messaging'],
  authors: [{ name: 'WorldPing Team' }],
  creator: 'WorldPing',
  publisher: 'WorldPing',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://worldping.app',
    siteName: 'WorldPing',
    title: 'WorldPing - Global Tap-to-Message Map',
    description: 'Drop messages anywhere on Earth. Discover what people are saying in Tokyo, New York, Paris, or your own street.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'WorldPing - Global Message Map'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WorldPing - Drop Messages Anywhere on Earth',
    description: 'Tap any location and see what the world is saying.',
    images: ['/og-image.png'],
    creator: '@worldping'
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://api.mapbox.com" />
      </head>
      <body className="antialiased bg-black text-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}


