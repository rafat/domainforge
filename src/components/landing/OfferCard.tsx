// src/components/landing/OfferCard.tsx
'use client'

import { useState } from 'react'
import { DomaOffer } from '@/types/doma'
import { formatUnits } from 'viem'
import { useWallet } from '@/hooks/useWallet'
import { domaApi } from '@/lib/domaApi'
import { acceptDomaOffer } from '@/lib/domaOrderbookSdk';
import { useWalletClient } from 'wagmi';

interface OfferCardProps {
  offer: DomaOffer
  isOwner: boolean
  domainId: string
  onOfferAction?: (offerId: string, action: 'accept' | 'reject') => void
}

export function OfferCard({ 
  offer, 
  isOwner, 
  domainId,
  onOfferAction 
}: OfferCardProps) {
  const { address, isConnected } = useWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { data: walletClient } = useWalletClient();

  // Format the offer price
  const formatPrice = () => {
    try {
      if (offer.price && offer.currency) {
        return `${formatUnits(BigInt(offer.price), offer.currency.decimals || 18)} ${offer.currency.symbol || 'ETH'}`
      }
      return `${offer.price} ETH`
    } catch (err) {
      console.error('Error formatting price:', err)
      return `${offer.price} ETH`
    }
  }

  // Check if offer is expired
  const isExpired = new Date(offer.expiresAt) < new Date()
  
  // Get status display text
  const getStatusText = () => {
    if (isExpired) return 'EXPIRED'
    return offer.status || 'PENDING'
  }

  // Get status color
  const getStatusColor = () => {
    if (isExpired) return 'bg-red-100 text-red-800'
    switch (offer.status) {
      case 'PENDING':
        return 'bg-blue-100 text-blue-800'
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Handle accept offer
  const handleAcceptOffer = async () => {
    if (!isConnected || !isOwner || !address || !walletClient) {
      setError('You must be connected as the owner to accept offers.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await acceptDomaOffer(
        offer.externalId, // Pass orderId directly as first parameter
        walletClient      // Pass walletClient as second parameter
        // chainId will use default (eip155:97476)
      );

      console.log('Offer accepted, transaction result:', result);
      alert('Offer accepted successfully! Transaction has been sent.');

      // Notify parent component to refetch data
      if (onOfferAction) {
        onOfferAction(offer.id, 'accept');
      }

    } catch (err: any) {
      console.error('Failed to accept offer:', err);
      setError(err.message || 'Failed to accept offer');
    } finally {
      setLoading(false);
    }
  }

  // Handle reject offer
  const handleRejectOffer = async () => {
    if (!isConnected || !isOwner || !address) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/offers/${offer.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', sellerAddress: address }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject offer');
      }
      alert('Offer rejected successfully!');
      if (onOfferAction) onOfferAction(offer.id, 'reject');
    } catch (err: any) {
      console.error('Failed to reject offer:', err);
      setError(err.message || 'Failed to reject offer');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900">
              {formatPrice()}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
            {isExpired && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Expired
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">
            From: {offer.offererAddress ? `${offer.offererAddress.slice(0, 6)}...${offer.offererAddress.slice(-4)}` : 'Unknown'}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex justify-between">
          <span className="font-medium">Offered:</span>
          <span>{new Date(offer.createdAt).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Expires:</span>
          <span>{new Date(offer.expiresAt).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Offer ID:</span>
          <span className="font-mono text-xs">{offer.id.slice(0, 8)}...</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {isOwner && offer.status === 'PENDING' && !isExpired && (
        <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleAcceptOffer}
            disabled={loading}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Accept Offer'
            )}
          </button>
          <button
            onClick={handleRejectOffer}
            disabled={loading}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            Reject
          </button>
        </div>
      )}

      {!isOwner && offer.status === 'PENDING' && !isExpired && address === offer.offererAddress && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            This is your offer. Wait for the owner to respond or withdraw before expiration.
          </p>
        </div>
      )}
    </div>
  )
}
