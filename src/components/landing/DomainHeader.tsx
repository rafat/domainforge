// src/components/landing/DomainHeader.tsx
'use client'

import { DomaDomain as Domain } from '@/types/doma'
import { formatAddress } from '@/lib/utils'
import { formatWeiToEth } from '@/utils/tokenIdUtils'

interface DomainHeaderProps {
  domain: Domain
  offers?: Array<{
    amount: string
    buyer: string
    createdAt: Date
  }>
}

export function DomainHeader({ domain, offers = [] }: DomainHeaderProps) {
  const highestOffer = offers.length > 0 
    ? offers.reduce((highest, current) => 
        parseFloat(current.amount) > parseFloat(highest.amount) ? current : highest
      )
    : null

  return (
    <div className="bg-white border-b">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {domain.name}
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            {domain.title || 'Premium Domain For Sale'}
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span>Owner: {formatAddress(domain.owner)}</span>
            <span>•</span>
            <span>Token ID: {domain.tokenId}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Buy Now Price */}
          {domain.buyNowPrice && (
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Buy Now</h3>
              <p className="text-2xl font-bold text-blue-600">
                {formatWeiToEth(domain.buyNowPrice)} ETH
              </p>
            </div>
          )}

          {/* Highest Offer */}
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 mb-2">Highest Offer</h3>
            <p className="text-2xl font-bold text-green-600">
              {highestOffer ? `${formatWeiToEth(highestOffer.amount)} ETH` : '—'}
            </p>
            {highestOffer && (
              <p className="text-xs text-green-600 mt-1">
                from {formatAddress(highestOffer.buyer)}
              </p>
            )}
          </div>

          {/* Total Offers */}
          <div className="text-center p-6 bg-purple-50 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800 mb-2">Total Offers</h3>
            <p className="text-2xl font-bold text-purple-600">
              {offers.length}
            </p>
          </div>
        </div>

        {/* Description */}
        {domain.description && (
          <div className="mt-8 text-center">
            <p className="text-gray-700 max-w-2xl mx-auto">
              {domain.description}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
