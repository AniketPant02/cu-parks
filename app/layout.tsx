import './global.css'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Navbar } from './components/nav'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Footer from './components/footer'
import { baseUrl } from './sitemap'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Parks @ Urbana-Champaign',
    template: '%s | Parks @ Urbana-Champaign',
  },
  description: 'A log of parks I\'ve visited in Urbana-Champaign.',
  openGraph: {
    title: 'Parks @ Urbana-Champaign',
    description: 'A log of parks I\'ve visited in Urbana-Champaign.',
    url: baseUrl,
    siteName: 'Parks @ Urbana-Champaign',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: "https://parks.aniketpant.me/meadowbrook_park/MeadowbrookPark3.jpeg",
        width: 1200,
        height: 630,
        alt: "Meadowbrook park preview"
      }
    ],
  },
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
}

const cx = (...classes) => classes.filter(Boolean).join(' ')

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={cx(
        'text-black bg-green-100',
        GeistSans.variable,
        GeistMono.variable
      )}
    >
      <body className="antialiased max-w-xl mx-4 mt-8 lg:mx-auto">
        <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
          <Navbar />
          {children}
          <Footer />
          <Analytics />
          <SpeedInsights />
        </main>
      </body>
    </html>
  )
}
