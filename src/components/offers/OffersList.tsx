// src/components/offers/OffersList.tsx
'use client'

import { useEffect, useState } from 'react'
import { DomaOffer } from '@/types/doma'
import { formatAddress, timeAgo, formatPrice } from '@/lib/utils'
import { useDoma } from '@/hooks/useDoma'

interface OffersListProps {
  tokenId: string
  onOfferAction?: (offerId: string, action: 'accept' | 'reject') => void
}

export function OffersList({ tokenId, onOfferAction }: OffersListProps) {
  const [offers, setOffers] = useState<DomaOffer[]>([])
  const [loading, setLoading] = useState(true)
  const { getOffers } = useDoma()

  useEffect(() => {
    loadOffers()
  }, [tokenId])

  const loadOffers = async () => {
    try {
      setLoading(true)
      const data = await getOffers(tokenId)
      setOffers(data.filter(offer => offer.status === 'PENDING'))
    } catch (error) {
      console.error('Failed to load offers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOfferAction = async (offerId: string, action: 'accept' | 'reject') => {
    try {
      await onOfferAction?.(offerId, action)
      await loadOffers() // Refresh offers
    } catch (error) {
      console.error(`Failed to ${action} offer:`, error)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Active Offers</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const getFormattedAddress = (address: string | undefined) => {
    if (!address) return 'Unknown';
    return formatAddress(address);
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Active Offers ({offers.length})</h3>
      
      {offers.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            💰
          </div>
          <p className="text-gray-500">No active offers yet</p>
          <p className="text-sm text-gray-400 mt-1">Be the first to make an offer!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {offers
            // FIX: Provide a fallback for amount in the sort function
            .sort((a, b) => parseFloat(b.amount ?? '0') - parseFloat(a.amount ?? '0'))
            // FIX: Filter out any offers that don't have an ID to be safe
            .filter(offer => offer.id)
            .map((offer) => (
              <div key={offer.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                        {/* Your helper function already handles an undefined buyer correctly */}
                        {getFormattedAddress(offer.buyer).slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {/* FIX: Use the nullish coalescing operator (??) to provide '0' as a default */}
                          {formatPrice(formatWeiToEth(offer.amount ?? '0'))} ETH
                        </p>
                        <p className="text-sm text-gray-500">
                          from {getFormattedAddress(offer.buyer)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {/* FIX: Check if expiresAt exists before creating a Date from it */}
                      {offer.expiresAt ? `${timeAgo(new Date(offer.expiresAt))} left` : 'No expiry'}
                    </p>
                    {offer.status === 'PENDING' && (
                      <div className="flex space-x-2 mt-2">
                        <button
                          // The .filter(o => o.id) above ensures offer.id is defined here
                          onClick={() => handleOfferAction(offer.id, 'accept')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          // The .filter(o => o.id) above ensures offer.id is defined here
                          onClick={() => handleOfferAction(offer.id, 'reject')}
                          className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
        </div>
  )
}
