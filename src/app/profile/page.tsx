// src/app/profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/hooks/useWallet'
import DomainCard from '@/components/DomainCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import ConnectWalletButton from '@/components/ConnectWalletButton'
import { DomaDomain as DomainNFT, DomaOffer as Offer } from '@/types/doma'
import { useDomaBlockchainDomains } from '@/hooks/useDomaBlockchainDomains'

export default function ProfilePage() {
  const { address: walletAddress, isConnected } = useWallet()
  const { domains: blockchainDomains, loading: blockchainLoading } = useDomaBlockchainDomains()
  const [activeTab, setActiveTab] = useState('domains')
  const [domains, setDomains] = useState<DomainNFT[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isConnected && walletAddress) {
      fetchUserData()
    }
  }, [isConnected, walletAddress, activeTab])

  const fetchUserData = async () => {
    if (!walletAddress) return

    setLoading(true)
    try {
      if (activeTab === 'domains') {
        // Use blockchain domains directly
        // Convert to the format expected by DomainCard
        const convertedDomains = blockchainDomains.map(domain => ({
          id: domain.name,
          name: domain.name,
          tokenId: domain.tokens[0]?.tokenId || '',
          tokenAddress: domain.tokens[0]?.tokenAddress || '',
          owner: domain.tokens[0]?.ownerAddress || '',
          contractAddress: domain.tokens[0]?.tokenAddress || '',
          chainId: parseInt(domain.tokens[0]?.chain.networkId.split(':')[1] || '97476', 10),
          registrationDate: new Date(domain.tokenizedAt),
          expiry: domain.expiresAt ? new Date(domain.expiresAt) : null,
          title: null,
          description: null,
          template: 'minimal',
          customCSS: null,
          isActive: new Date(domain.expiresAt) > new Date(),
          screenshot: null,
          metaTitle: null,
          metaDescription: null,
          buyNowPrice: null,
          acceptOffers: true,
          createdAt: new Date(domain.tokenizedAt),
          updatedAt: new Date(domain.tokenizedAt),
          views: 0,
          forSale: false,
          price: null,
          records: [],
          offers: []
        }))
        setDomains(convertedDomains)
      } else if (activeTab === 'offers') {
        const response = await fetch(`/api/users/${walletAddress}/offers`)
        const data = await response.json()
        setOffers(data.offers || [])
      } else if (activeTab === 'activity') {
        // Fetch user activities
        const response = await fetch(`/api/users/${walletAddress}/activities`)
        const data = await response.json()
        setActivities(data.activities || [])
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      setLoading(false)
    }
  }
  const handleListForSale = async (domain: DomainNFT, price: string) => {
    try {
      const response = await fetch(`/api/domains/${domain.tokenId}/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price: parseFloat(price),
          seller: walletAddress,
        }),
      })
      if (response.ok) {
        alert('Domain listed for sale successfully!')
        fetchUserData() // Refresh data
      } else {
        alert('Failed to list domain for sale')
      }
    } catch (error) {
      console.error('Failed to list domain:', error)
      alert('Failed to list domain for sale')
    }
  }
  const handleAcceptOffer = async (offer: Offer) => {
    try {
      const response = await fetch(`/api/offers/${offer.id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seller: walletAddress,
        }),
      })
      if (response.ok) {
        alert('Offer accepted successfully!')
        fetchUserData() // Refresh data
      } else {
        alert('Failed to accept offer')
      }
    } catch (error) {
      console.error('Failed to accept offer:', error)
      alert('Failed to accept offer')
    }
  }
  const handleRejectOffer = async (offer: Offer) => {
    try {
      const response = await fetch(`/api/offers/${offer.id}/reject`, {
        method: 'POST',
      })
      if (response.ok) {
        alert('Offer rejected successfully!')
        fetchUserData() // Refresh data
      } else {
        alert('Failed to reject offer')
      }
    } catch (error) {
      console.error('Failed to reject offer:', error)
      alert('Failed to reject offer')
    }
  }
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to view your profile and manage your domains.
          </p>
          <ConnectWalletButton />
        </div>
      </div>
    )
  }
  const tabs = [
    { id: 'domains', name: 'My Domains', count: blockchainDomains.length },
    { id: 'offers', name: 'Offers', count: offers.length },
    { id: 'activity', name: 'Activity', count: activities.length },
  ]
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {walletAddress?.slice(2, 4).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
              </h1>
              <p className="text-gray-600">Ethereum Address</p>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
        {/* Tab Content */}
        {loading || blockchainLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div>
            {activeTab === 'domains' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    My Domains ({blockchainDomains.length})
                  </h2>
                </div>
                
                {blockchainDomains.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 text-lg mb-4">No domains found</div>
                    <a
                      href="/marketplace"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Browse Marketplace
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {blockchainDomains.map((domain) => (
                      <div key={`${domain.name}-${domain.tokenizedAt}`} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900 truncate max-w-[200px]">{domain.name}</h3>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex justify-between">
                              <span>Expires:</span>
                              <span>{new Date(domain.expiresAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Type:</span>
                              <span>{domain.tokens[0]?.type || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Chain:</span>
                              <span>{domain.tokens[0]?.chain.name || 'N/A'}</span>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1">
                            {new Date(domain.expiresAt) < new Date() ? (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Expired</span>
                            ) : (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Active</span>
                            )}
                            {domain.eoi && (
                              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">EOI</span>
                            )}
                            {domain.claimedBy && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Claimed</span>
                            )}
                          </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                          <a 
                            href={`/builder/new?tokenId=${encodeURIComponent(domain.tokens[0]?.tokenId || '')}&domainName=${encodeURIComponent(domain.name)}`}
                            className="block text-center text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                          >
                            Create Landing Page
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'offers' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Received Offers ({offers.length})
                </h2>
                
                {offers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 text-lg mb-4">No offers received</div>
                    <p className="text-gray-400">
                      Offers for your domains will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {offers.map((offer) => (
                      <div key={offer.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium text-gray-900">{offer.domainId}</span>
                            <p className="text-gray-600 mt-1">
                              Offer from {offer.buyer ? `${offer.buyer.slice(0, 6)}...${offer.buyer.slice(-4)}` : 'Unknown'}
                            </p>
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                              <span>Amount: {offer.amount} ETH</span>
                              <span>•</span>
                              <span>Expires: {new Date(offer.expiresAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAcceptOffer(offer)}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectOffer(offer)}
                              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'activity' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Activity</h2>
                <div className="bg-white rounded-lg shadow-sm">
                  {activities.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {activities.map((activity) => (
                        <div key={activity.id} className="p-4 flex items-start">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            activity.type === 'domain_registration' ? 'bg-blue-100' :
                            activity.type === 'offer_received' ? 'bg-yellow-100' : 'bg-green-100'
                          }`}>
                            {activity.type === 'domain_registration' && (
                              <span className="text-blue-600 text-sm">R</span>
                            )}
                            {activity.type === 'offer_received' && (
                              <span className="text-yellow-600 text-sm">O</span>
                            )}
                            {activity.type === 'domain_sale' && (
                              <span className="text-green-600 text-sm">S</span>
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.type === 'domain_registration' && `Registered ${activity.domainName}`}
                              {activity.type === 'offer_received' && `Offer received for ${activity.domainName}`}
                              {activity.type === 'domain_sale' && `Sold ${activity.domainName}`}
                            </p>
                            <p className="text-sm text-gray-500">
                              {activity.type === 'offer_received' && `Amount: ${activity.amount}`}
                              {activity.type === 'domain_sale' && `Sale price: ${activity.amount}`}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="ml-auto">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                              activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {activity.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="text-gray-500 text-lg mb-4">No activity yet</div>
                      <p className="text-gray-400 max-w-md mx-auto">
                        Activities like domain registrations, sales, and offers will appear here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
