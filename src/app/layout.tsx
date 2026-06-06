import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Navbar } from '@/components/layout/navbar'
import { LangProvider } from '@/components/layout/lang-provider'
import { AuthGate } from '@/components/layout/auth-gate'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'AdMan',
  description: 'Self-hosted advertisement management platform',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LangProvider>
          <Navbar />
          <main className="min-h-screen bg-zinc-50 px-12 lg:px-32">
            <AuthGate>{children}</AuthGate>
          </main>
        </LangProvider>
      </body>
    </html>
  )
}
