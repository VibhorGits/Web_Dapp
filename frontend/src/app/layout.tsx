// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers' // <-- Import at the top

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TrustTrade App',
  description: 'Decentralized Escrow dApp',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers> {/* <-- Wrap children */}
      </body>
    </html>
  )
}