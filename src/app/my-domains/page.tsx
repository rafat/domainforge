// src/app/my-domains/page.tsx
'use client'

import { useState } from 'react'
import BlockchainUserDomainsSection from '@/components/BlockchainUserDomainsSection'
import DebugWalletSwitcher from '@/components/DebugWalletSwitcher'
import { useWallet } from '@/hooks/useWallet'

export default function MyDomainsPage() {
  const { isConnected } = useWallet()
  const [debugAddress, setDebugAddress] = useState<string | undefined>()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              My Domains
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Manage your blockchain domains directly from the Doma Protocol. 
              View, transfer, and track your digital assets in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Blockchain Domains Section */}
      <BlockchainUserDomainsSection debugAddress={debugAddress} />

      {/* Debug Panel - Only in development */}
      {process.env.NODE_ENV === 'development' && (
        <DebugWalletSwitcher 
          onAddressChange={setDebugAddress}
        />
      )}
    </div>
  )
}