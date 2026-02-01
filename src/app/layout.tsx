import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Sidebar } from '@/components/layout/sidebar'
import { LangProvider } from '@/components/layout/lang-provider'
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
          <Sidebar />
          <main className="ml-56 min-h-screen bg-zinc-50">{children}</main>
        </LangProvider>
      </body>
    </html>
  )
}
