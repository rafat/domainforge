// src/components/OfferCard.tsx
'use client'

import { useState } from 'react'
import { DomaOffer } from '@/types/doma'
import { useWallet } from '@/hooks/useWallet'

interface OfferCardProps {
  offer: DomaOffer
  onAccept?: (offer: DomaOffer) => void
  onReject?: (offer: DomaOffer) => void
  onWithdraw?: (offer: DomaOffer) => void
  showActions?: boolean
}

export default function OfferCard({ 
  offer, 
  onAccept, 
  onReject, 
  onWithdraw, 
  showActions = true 
}: OfferCardProps) {
  const { address } = useWallet()
  const [loading, setLoading] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const isExpired = new Date(offer.expiry) < new Date()
  const isBuyer = address === offer.buyer
  const canAcceptOrReject = showActions && offer.status === 'PENDING' && !isExpired && !isBuyer
  const canWithdraw = showActions && offer.status === 'PENDING' && isBuyer

  const handleAccept = async () => {
    if (!onAccept) return
    setLoading(true)
    try {
      await onAccept(offer)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!onReject) return
    setLoading(true)
    try {
      await onReject(offer)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!onWithdraw) return
    setLoading(true)
    try {
      await onWithdraw(offer)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {offer.amount} ETH
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(offer.status)}`}>
              {offer.status.charAt(0) + offer.status.slice(1).toLowerCase()}
            </span>
            {isExpired && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Expired
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">
            From: {offer.buyer.slice(0, 6)}...{offer.buyer.slice(-4)}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex justify-between">
          <span>Expires:</span>
          <span>{new Date(offer.expiry).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Created:</span>
          <span>{new Date(offer.createdAt).toLocaleString()}</span>
        </div>
        {offer.txHash && (
          <div className="flex justify-between">
            <span>Transaction:</span>
            <a 
              href={`https://etherscan.io/tx/${offer.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View on Etherscan
            </a>
          </div>
        )}
      </div>

      {showActions && (canAcceptOrReject || canWithdraw) && (
        <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
          {canAcceptOrReject && (
            <>
              <button
                onClick={handleAccept}
                disabled={loading}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Accept Offer
              </button>
              <button
                onClick={handleReject}
                disabled={loading}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Reject Offer
              </button>
            </>
          )}
          
          {canWithdraw && (
            <button
              onClick={handleWithdraw}
              disabled={loading}
              className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 disabled:opacity-50 transition-colors"
            >
              Withdraw Offer
            </button>
          )}
        </div>
      )}
    </div>
  )
}
