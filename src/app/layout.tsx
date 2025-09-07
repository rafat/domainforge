// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/NavBar'

import ErrorBoundary from '@/components/ErrorBoundary'
import {Web3ModalProvider} from '@/components/Web3ModalProvider'
import { WalletProvider } from '@/contexts/WalletContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DOMA - Decentralized Domain Marketplace',
  description: 'Buy, sell, and manage decentralized domains on the blockchain',
  keywords: ['blockchain', 'domains', 'NFT', 'marketplace', 'decentralized'],
  authors: [{ name: 'DOMA Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3ModalProvider>
          <WalletProvider>
            <ErrorBoundary>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">
                  {children}
                </main>
                
              </div>
            </ErrorBoundary>
          </WalletProvider>
        </Web3ModalProvider>
      </body>
    </html>
  )
}