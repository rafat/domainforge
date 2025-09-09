// src/components/DomainCard.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useWallet } from '@/hooks/useWallet'
import { DomaDomain as DomainNFT } from '@/types/doma'
import { formatTokenIdDisplay } from '@/utils/tokenIdUtils'

interface DomainCardProps {
  domain: DomainNFT
  onQuickOffer?: (domain: DomainNFT, amount: string) => void
}

export default function DomainCard({ domain, onQuickOffer }: DomainCardProps) {
  const { address, isConnected } = useWallet()
  const [showQuickOffer, setShowQuickOffer] = useState(false)
  const [offerAmount, setOfferAmount] = useState('')

  const handleQuickOffer = () => {
    if (offerAmount && onQuickOffer) {
      onQuickOffer(domain, offerAmount)
      setOfferAmount('')
      setShowQuickOffer(false)
    }
  }

  // Handle both database domain model (owner) and blockchain domain model (ownerAddress)
  const owner = (domain as any).owner || (domain as any).ownerAddress || ''
  const isOwner = isConnected && address && owner && owner.toLowerCase() === address.toLowerCase()
  
  // For blockchain domains, we need to get the tokenId from the tokens array
  const tokenId = domain.tokenId || ((domain as any).tokens && (domain as any).tokens.length > 0 ? (domain as any).tokens[0].tokenId : null)

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'listed':
        return 'bg-blue-100 text-blue-800'
      case 'sold':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {domain.name}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
              {domain.forSale ? 'For Sale' : 'Not For Sale'}
            </span>
          </div>
          {domain.price && (
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">{domain.price} ETH</p>
              <p className="text-sm text-gray-500">Buy Now</p>
            </div>
          )}
        </div>

        {domain.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {domain.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <span>Token #{tokenId ? formatTokenIdDisplay(tokenId) : 'N/A'}</span>
            {domain.expiry && (
              <span>
                Expires: {new Date(domain.expiry).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href={tokenId ? `/domains/${tokenId}` : '#'}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-center hover:bg-blue-700 transition-colors"
          >
            View Details
          </Link>
          
          {domain.forSale && !showQuickOffer && (
            <button
              onClick={() => setShowQuickOffer(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Make Offer
            </button>
          )}
        </div>

                {isOwner && domain.id && domain.tokenId && (
          <div className="mt-3 flex space-x-2">
            {domain.isActive ? (
              <>
                <Link
                  href={`/landing/${domain.name}`}
                  target="_blank"
                  className="flex-1 text-center text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                >
                  View Page
                </Link>
                <Link
                  href={`/builder/${domain.id}`}
                  className="flex-1 text-center text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                >
                  Edit Page
                </Link>
              </>
            ) : (
              <Link
                href={`/builder/${domain.id}`}
                className="flex-1 text-center text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                Create Page
              </Link>
            )}
          </div>
        )}

        {showQuickOffer && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-600 font-medium">ETH</span>
              <button
                onClick={handleQuickOffer}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Submit
              </button>
              <button
                onClick={() => setShowQuickOffer(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}