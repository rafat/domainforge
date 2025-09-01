// src/components/UserDomainsSection.tsx
'use client'

import Link from 'next/link'
import { useUserDomains } from '@/hooks/useUserDomains'
import { useWallet } from '@/hooks/useWallet'
import DomainCard from '@/components/DomainCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import ConnectWalletButton from '@/components/ConnectWalletButton'
import { DomaDomain as DomainNFT } from '@/types/doma'

interface UserDomainsSectionProps {
  onQuickOffer?: (domain: DomainNFT, amount: string) => void
  debugAddress?: string
}

export default function UserDomainsSection({ onQuickOffer, debugAddress }: UserDomainsSectionProps) {
  const { isConnected, address } = useWallet()
  const { domains, loading, error, refetch } = useUserDomains(debugAddress)

  // Don't render anything if wallet is not connected and no debug address
  if (!isConnected && !debugAddress) {
    return (
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to view and manage your domains
            </p>
            <div className="flex justify-center">
              <ConnectWalletButton />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (loading) {
    return (
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Your Domains</h2>
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Your Domains</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600">Error loading domains: {error}</p>
              <button
                onClick={refetch}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Your Domains
          </h2>
          <p className="text-xl text-gray-600">
            {domains.length > 0 
              ? `You own ${domains.length} domain${domains.length === 1 ? '' : 's'}`
              : "You don't own any domains yet"
            }
          </p>
          {address && (
            <p className="text-sm text-gray-500 mt-2">
              Connected: {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          )}
        </div>

        {domains.length === 0 ? (
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-5a2 2 0 00-2-2H8a2 2 0 00-2 2v5m5 0V9a2 2 0 012-2h2a2 2 0 012 2v5" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No domains found
              </h3>
              <p className="text-gray-600 mb-6">
                Start building your digital identity by minting or purchasing a domain.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/mint"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Mint Domain
                </Link>
                <Link
                  href="/marketplace"
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Browse Marketplace
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {domains.map((domain) => (
                <DomainCard
                  key={domain.tokenId}
                  domain={domain}
                  onQuickOffer={onQuickOffer}
                />
              ))}
            </div>
            
            <div className="text-center">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/profile"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Manage All Domains
                </Link>
                <Link
                  href="/mint"
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Mint New Domain
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}