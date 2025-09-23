// src/app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DomainCard from '@/components/DomainCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import BlockchainUserDomainsSection from '@/components/BlockchainUserDomainsSection'
import DebugWalletSwitcher from '@/components/DebugWalletSwitcher'
import { DomaDomain as DomainNFT } from '@/types/doma'
import { useWallet } from '@/hooks/useWallet'

export default function HomePage() {
  const { isConnected } = useWallet()
  const [recentDomains, setRecentDomains] = useState<DomainNFT[]>([])
  const [loading, setLoading] = useState(true)
  const [debugAddress, setDebugAddress] = useState<string | undefined>()
  const [stats, setStats] = useState({
    totalDomains: 0,
    totalSales: 0,
    averagePrice: 0,
    activeUsers: 0
  })

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      setLoading(true)
      const [domainsRes, statsRes] = await Promise.all([
        fetch('/api/domains?limit=8&featured=true'),
        fetch('/api/stats')
      ])
      
      const domainsData = await domainsRes.json()
      const statsData = await statsRes.json()
      
      setRecentDomains(domainsData.slice(4, 8))
      setStats(statsData)
    } catch (error) {
      console.error('Failed to fetch home data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickOffer = async (domain: DomainNFT, amount: string) => {
    if (!isConnected) {
      alert('Please connect your wallet to make an offer')
      return
    }
    
    try {
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + 7) // 7 days from now

      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenId: domain.tokenId,
          buyer: '0x1234...', // Should be actual wallet address
          amount: parseFloat(amount),
          expiry: expiry.toISOString(),
        }),
      })

      if (response.ok) {
        alert('Offer submitted successfully!')
      } else {
        alert('Failed to submit offer')
      }
    } catch (error) {
      console.error('Failed to submit offer:', error)
      alert('Failed to submit offer')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Own Your Digital Identity
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
              Buy, sell, and manage decentralized domains on the blockchain. 
              Your gateway to the decentralized web starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/marketplace"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Explore Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* User Domains Section - Shows when wallet is connected */}
      <BlockchainUserDomainsSection debugAddress={debugAddress} />

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started with DOMA in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Connect Wallet
              </h3>
              <p className="text-gray-600">
                Connect your Web3 wallet to start buying or selling domains.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Browse & Buy
              </h3>
              <p className="text-gray-600">
                Explore our marketplace and find the perfect domain for your needs.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Own & Manage
              </h3>
              <p className="text-gray-600">
                Own and manage your domains directly from your wallet. Set up redirects, sell, or transfer.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Call to Action */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already secured their digital identity with DOMA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/marketplace"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>
      
      {/* Debug Component for Development */}
      <DebugWalletSwitcher onAddressChange={setDebugAddress} />
    </div>
  )
}

