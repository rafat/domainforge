// src/app/marketplace/page.tsx
'use client'

import { useState, useEffect } from 'react'
import DomainCard from '@/components/DomainCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import { DomaDomain as DomainNFT } from '@/types/doma'
import { useWallet } from '@/hooks/useWallet'

const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
  { value: 'recent', label: 'Recently Added' },
]

const FILTER_OPTIONS = {
  priceRange: [
    { value: '0-1', label: 'Under 1 ETH' },
    { value: '1-5', label: '1 - 5 ETH' },
    { value: '5-10', label: '5 - 10 ETH' },
    { value: '10+', label: '10+ ETH' },
  ],
  length: [
    { value: '3', label: '3 characters' },
    { value: '4', label: '4 characters' },
    { value: '5', label: '5 characters' },
    { value: '6+', label: '6+ characters' },
  ],
  extension: [
    { value: '.doma', label: '.doma' },
    { value: '.web3', label: '.web3' },
    { value: '.chain', label: '.chain' },
    { value: '.nft', label: '.nft' },
  ]
}

export default function MarketplacePage() {
  const { isConnected } = useWallet()
  const [domains, setDomains] = useState<DomainNFT[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [filters, setFilters] = useState({
    priceRange: '',
    length: '',
    extension: '',
    forSale: true,
  })
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchDomains()
  }, [searchQuery, sortBy, filters, currentPage])

  const fetchDomains = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sort: sortBy,
        ...(searchQuery && { search: searchQuery }),
        ...(filters.priceRange && { priceRange: filters.priceRange }),
        ...(filters.length && { length: filters.length }),
        ...(filters.extension && { extension: filters.extension }),
        forSale: 'true', // Always filter for domains marked for sale
        hasBuyNowPrice: 'true', // Only show domains with a buy now price
        isActive: 'true', // Only show published domains
      })

      const response = await fetch(`/api/domains?${params}`)
      const data = await response.json()
      
      setDomains(data.domains || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch domains:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType] === value ? '' : value
    }))
    setCurrentPage(1)
  }

  const handleQuickOffer = async (domain: DomainNFT, amount: string) => {
    if (!isConnected) {
      alert('Please connect your wallet to make an offer')
      return
    }
    
    try {
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + 7)

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

  const clearFilters = () => {
    setFilters({
      priceRange: '',
      length: '',
      extension: '',
      forSale: true,
    })
    setSearchQuery('')
    setSortBy('recent')
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Domain Marketplace</h1>
          <p className="text-gray-600">
            Discover and purchase premium decentralized domains
          </p>
        </div>

        {/* Search and Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search domains..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
                  <div className="space-y-2">
                    {FILTER_OPTIONS.priceRange.map(option => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.priceRange === option.value}
                          onChange={() => handleFilterChange('priceRange', option.value)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Domain Length</h3>
                  <div className="space-y-2">
                    {FILTER_OPTIONS.length.map(option => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.length === option.value}
                          onChange={() => handleFilterChange('length', option.value)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Extension</h3>
                  <div className="space-y-2">
                    {FILTER_OPTIONS.extension.map(option => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.extension === option.value}
                          onChange={() => handleFilterChange('extension', option.value)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Clear All Filters
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              Showing {domains.length} domains
            </div>
            
            {domains.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-xl mb-4">No domains found</div>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {domains.map((domain) => (
                    <DomainCard
                      key={domain.tokenId}
                      domain={domain}
                      onQuickOffer={handleQuickOffer}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                        if (page > totalPages) return null
                        
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 border rounded-lg ${
                              currentPage === page
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
