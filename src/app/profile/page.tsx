// src/app/profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/hooks/useWallet'
import DomainCard from '@/components/DomainCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import { DomaDomain as DomainNFT, DomaOffer as Offer } from '@/types/doma'

export default function ProfilePage() {
  const { address, isConnected } = useWallet()
  const [activeTab, setActiveTab] = useState('domains')
  const [domains, setDomains] = useState<DomainNFT[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isConnected && address) {
      fetchUserData()
    }
  }, [isConnected, address, activeTab])

  const fetchUserData = async () => {
    if (!address) return

    setLoading(true)
    try {
      if (activeTab === 'domains') {
        const response = await fetch(`/api/users/${address}/domains`)
        const data = await response.json()
        setDomains(data.domains || [])
      } else if (activeTab === 'offers') {
        const response = await fetch(`/api/users/${address}/offers`)
        const data = await response.json()
        setOffers(data.offers || [])
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
          seller: address,
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
          seller: address,
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
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }
  const tabs = [
    { id: 'domains', name: 'My Domains', count: domains.length },
    { id: 'builder', name: 'Page Builder', count: domains.filter(d => d.isActive).length },
    { id: 'offers', name: 'Offers', count: offers.length },
    { id: 'activity', name: 'Activity', count: 0 },
    { id: 'settings', name: 'Settings', count: 0 },
  ]
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {address?.slice(2, 4).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {address?.slice(0, 6)}...{address?.slice(-4)}
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
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div>
            {activeTab === 'domains' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    My Domains ({domains.length})
                  </h2>
                </div>
                
                {domains.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 text-lg mb-4">No domains found</div>
                    <a
                      href="/mint"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Mint Your First Domain
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {domains.map((domain) => (
                                              <DomainCard 
                          key={domain.id} 
                          domain={domain} 
                        />
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
                              Offer from {offer.buyer.slice(0, 6)}...{offer.buyer.slice(-4)}
                            </p>
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                              <span>Amount: {offer.amount} ETH</span>
                              <span>•</span>
                              <span>Expires: {new Date(offer.expiry).toLocaleDateString()}</span>
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
            {activeTab === 'builder' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Landing Page Builder</h2>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  {domains.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-500 text-lg mb-4">No domains found</div>
                      <a
                        href="/mint"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Mint Your First Domain
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Select a Domain</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {domains.map((domain) => (
                            <a
                              key={domain.id}
                              href={`/profile?tab=builder&domain=${domain.tokenId}`}
                              className={`border rounded-lg p-4 hover:border-blue-500 transition-colors ${
                                typeof window !== 'undefined' && 
                                new URLSearchParams(window.location.search).get('domain') === domain.tokenId
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200'
                              }`}
                            >
                              <div className="font-medium text-gray-900">{domain.name}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                {domain.isActive ? (
                                  <span className="text-green-600">Published</span>
                                ) : (
                                  <span className="text-gray-500">Draft</span>
                                )}
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                      
                      {/* PageBuilderSection component was here but is not needed */}
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'builder' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Page Builder</h2>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="mb-6">
                    <p className="text-gray-600 mb-4">
                      Create custom landing pages for your domains to showcase them for sale.
                    </p>
                  </div>
                  
                  {domains.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-500 text-lg mb-4">No domains found</div>
                      <a
                        href="/mint"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Mint Your First Domain
                      </a>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {domains.map((domain) => (
                        <div key={domain.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold">
                                {domain.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{domain.name}</h3>
                              <p className="text-xs text-gray-500">Token: {domain.tokenId.slice(0, 8)}...</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mb-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              domain.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {domain.isActive ? 'Published' : 'Draft'}
                            </span>
                            
                            {domain.forSale && domain.price && (
                              <span className="text-sm font-medium text-green-600">
                                {domain.price} ETH
                              </span>
                            )}
                          </div>
                          
                          <a
                            href={`/builder/${domain.id}`}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-center text-sm font-medium block"
                          >
                            {domain.isActive ? 'Edit Page' : 'Create Page'}
                          </a>
                          
                          {domain.isActive && (
                            <a
                              href={`/landing/${domain.tokenId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full mt-2 text-blue-600 py-2 rounded-lg hover:bg-blue-50 text-center text-sm font-medium block border border-blue-600"
                            >
                              View Published
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'activity' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Activity</h2>
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg mb-4">Activity feed coming soon</div>
                  <p className="text-gray-400">
                    Track all your domain transactions and activities
                  </p>
                </div>
              </div>
            )}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Settings</h2>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Settings</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Display Name
                          </label>
                          <input
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter display name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Email Notifications
                          </label>
                          <div className="mt-2 space-y-2">
                            <label className="flex items-center">
                              <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                              <span className="ml-2 text-gray-700">Domain expiration reminders</span>
                            </label>
                            <label className="flex items-center">
                              <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                              <span className="ml-2 text-gray-700">New offer notifications</span>
                            </label>
                            <label className="flex items-center">
                              <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                              <span className="ml-2 text-gray-700">Transaction confirmations</span>
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                          Save Settings
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
