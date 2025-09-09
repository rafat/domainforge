// src/app/domains/[tokenId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useWallet } from '@/hooks/useWallet'
import LoadingSpinner from '@/components/LoadingSpinner'
import { DomaOffer as Offer, DomaDomain as DomainNFT } from '@/types/doma'

export default function DomainDetailPage() {
  const { tokenId } = useParams()
  const { address, isConnected } = useWallet()
  const [domain, setDomain] = useState<DomainNFT | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [offerAmount, setOfferAmount] = useState('')
  const [submittingOffer, setSubmittingOffer] = useState(false)

  useEffect(() => {
    if (tokenId) {
      fetchDomainDetails()
    }
  }, [tokenId])

  const fetchDomainDetails = async () => {
    try {
      setLoading(true)
      const [domainRes, offersRes] = await Promise.all([
        fetch(`/api/domains/${tokenId}`),
        fetch(`/api/domains/${tokenId}/offers`)
      ])
      
      const domainData = await domainRes.json()
      const offersData = await offersRes.json()
      
      setDomain(domainData.domain)
      setOffers(offersData.offers || [])
    } catch (error) {
      console.error('Failed to fetch domain details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMakeOffer = async () => {
    if (!isConnected || !offerAmount || !domain) return

    setSubmittingOffer(true)
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
          buyer: address,
          amount: parseFloat(offerAmount),
          expiry: expiry.toISOString(),
        }),
      })

      if (response.ok) {
        alert('Offer submitted successfully!')
        setOfferAmount('')
        fetchDomainDetails() // Refresh offers
      } else {
        alert('Failed to submit offer')
      }
    } catch (error) {
      console.error('Failed to submit offer:', error)
      alert('Failed to submit offer')
    } finally {
      setSubmittingOffer(false)
    }
  }

  const handleBuyNow = async () => {
    if (!isConnected || !domain) return

    try {
      const response = await fetch(`/api/domains/${domain.tokenId}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyer: address,
          amount: domain.price,
        }),
      })

      if (response.ok) {
        alert('Purchase successful!')
        fetchDomainDetails() // Refresh domain data
      } else {
        alert('Purchase failed')
      }
    } catch (error) {
      console.error('Purchase failed:', error)
      alert('Purchase failed')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  if (!domain) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Domain Not Found</h1>
          <p className="text-gray-600 mb-6">
            The domain you're looking for doesn't exist or has been removed.
          </p>
          <a
            href="/marketplace"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse Marketplace
          </a>
        </div>
      </div>
    )
  }
  const isOwner = address && domain.owner.toLowerCase() === address.toLowerCase()
  const tabs = ['overview', 'offers', 'activity', 'records']
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Domain Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {domain.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{domain.name}</h1>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="text-gray-600">
                      Owner: {domain.owner.slice(0, 8)}...{domain.owner.slice(-6)}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">
                      Expires: {domain.expiry ? new Date(domain.expiry).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
                {domain.forSale && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    For Sale
                  </span>
                )}
                {domain.name.includes('.premium') && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Premium
                  </span>
                )}
              </div>
            </div>
            {/* Action Buttons */}
            <div className="mt-6 lg:mt-0 lg:ml-6">
              {domain.forSale && !isOwner && (
                <div className="space-y-3">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Price</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {domain.price} ETH
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={handleBuyNow}
                      disabled={!isConnected}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {isConnected ? 'Buy Now' : 'Connect Wallet'}
                    </button>
                    <button
                      onClick={() => setActiveTab('offers')}
                      className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 font-medium"
                    >
                      Make Offer
                    </button>
                  </div>
                </div>
              )}
              {!domain.forSale && !isOwner && (
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-3">Not for sale</div>
                  <button
                    onClick={() => setActiveTab('offers')}
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 font-medium"
                  >
                    Make Offer
                  </button>
                </div>
              )}
                          {isOwner && (
              <div className="text-center space-y-3">
                <div className="text-sm text-gray-600 mb-3">You own this domain</div>
                <a
                  href="/profile"
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 font-medium inline-block"
                >
                  Manage Domain
                </a>
                {domain.isActive ? (
                  <a
                    href={`/landing/${domain.tokenId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-100 text-green-700 px-6 py-3 rounded-lg hover:bg-green-200 font-medium inline-block"
                  >
                    View Published Page
                  </a>
                ) : (
                  <a
                    href={`/profile?tab=builder&domain=${domain.tokenId}`}
                    className="bg-blue-100 text-blue-700 px-6 py-3 rounded-lg hover:bg-blue-200 font-medium inline-block"
                  >
                    Create Landing Page
                  </a>
                )}
              </div>
            )}
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
                {tab === 'offers' && offers.length > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {offers.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Info */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Domain Information</h2>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Token ID</dt>
                      <dd className="mt-1 text-sm text-gray-900">#{domain.tokenId}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Registration Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(domain.registrationDate).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {domain.expiry ? new Date(domain.expiry).toLocaleDateString() : 'N/A'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Blockchain</dt>
                      <dd className="mt-1 text-sm text-gray-900">Ethereum</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Owner Address</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-mono">
                        {domain.owner}
                      </dd>
                    </div>
                  </dl>
                </div>
                {/* Domain Records */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">DNS Records</h2>
                  <div className="space-y-4">
                    {domain.records && domain.records.length > 0 ? (
                      domain.records.map((record: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium text-gray-900">{record.type}</span>
                              <span className="ml-2 text-gray-600">{record.name}</span>
                            </div>
                            <span className="text-gray-500 font-mono text-sm">{record.value}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No DNS records configured</p>
                    )}
                  </div>
                </div>
              </div>
              {/* Sidebar */}
              <div className="space-y-6">
                {/* Price History */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Price History</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Original Mint</span>
                      <span className="font-medium">0.5 ETH</span>
                    </div>
                    {domain.forSale && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Current Price</span>
                        <span className="font-medium">{domain.price} ETH</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Market Stats */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Views (24h)</span>
                      <span className="font-medium">{domain.views || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Offers</span>
                      <span className="font-medium">{offers.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Length</span>
                      <span className="font-medium">{domain.name.split('.')[0].length} chars</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'offers' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Active Offers ({offers.length})
                  </h2>
                  
                  {offers.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No offers yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {offers.map((offer) => (
                        <div key={offer.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-gray-900">
                                {offer.amount} ETH
                              </div>
                              <div className="text-sm text-gray-600">
                                From {offer.buyer ? `${offer.buyer.slice(0, 8)}...${offer.buyer.slice(-6)}` : 'Unknown'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">
                                Expires {offer.expiresAt ? new Date(offer.expiresAt).toLocaleDateString() : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Make Offer Sidebar */}
              {!isOwner && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Make an Offer</h3>
                  
                  {!isConnected ? (
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">Connect your wallet to make an offer</p>
                      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                        Connect Wallet
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Offer Amount (ETH)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={offerAmount}
                          onChange={(e) => setOfferAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="text-xs text-gray-600">
                        <p>• Offers expire in 7 days</p>
                        <p>• You can cancel anytime before acceptance</p>
                        <p>• Funds will be held in escrow</p>
                      </div>
                      <button
                        onClick={handleMakeOffer}
                        disabled={!offerAmount || submittingOffer || parseFloat(offerAmount) <= 0}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {submittingOffer ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span className="ml-2">Submitting...</span>
                          </>
                        ) : (
                          'Make Offer'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {activeTab === 'activity' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Activity History</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">Domain Minted</p>
                        <p className="text-sm text-gray-600">
                          Minted by {domain.owner.slice(0, 8)}...{domain.owner.slice(-6)}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(domain.registrationDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {domain.forSale && (
                  <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">Listed for Sale</p>
                          <p className="text-sm text-gray-600">Price: {domain.price} ETH</p>
                        </div>
                        <span className="text-sm text-gray-500">Recent</span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="text-center py-6 text-gray-500">
                  <p>More activity history coming soon</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'records' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">DNS Records</h2>
                {isOwner && (
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                    Edit Records
                  </button>
                )}
              </div>
              {domain.records && domain.records.length > 0 ? (
                <div className="space-y-4">
                  {domain.records.map((record: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Type</span>
                          <p className="mt-1 text-gray-900">{record.type}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Name</span>
                          <p className="mt-1 text-gray-900">{record.name}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Value</span>
                          <p className="mt-1 text-gray-900 font-mono text-sm break-all">{record.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286M30 14a6 6 0 11-12 0 6 6 0 0112 0zm12 6a4 4 0 11-8 0 4 4 0 018 0zm-28 0a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No DNS Records</h3>
                  <p className="text-gray-500 mb-6">
                    {isOwner 
                      ? "Configure DNS records to point your domain to websites, wallets, or other services."
                      : "This domain hasn't configured any DNS records yet."
                    }
                  </p>
                  {isOwner && (
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                      Add DNS Record
                    </button>
                  )}
                </div>
              )}
              {isOwner && domain.records && domain.records.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 mr-3">
                    Add Record
                  </button>
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                    Import from ENS
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

