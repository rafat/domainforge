// src/components/chat/OfferButton.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useDoma } from '@/hooks/useDoma'
import { domaApi } from '@/lib/domaApi'

interface OfferButtonProps {
  domainId: string
  onOfferMade: (message: string) => void
}

export function OfferButton({ domainId, onOfferMade }: OfferButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [offerStatus, setOfferStatus] = useState<'pending' | 'submitted' | 'accepted' | 'rejected' | 'expired' | null>(null)
  const [offerId, setOfferId] = useState<string | null>(null)
  const { address } = useAccount()
  const { createOffer, isOfferActive, isOfferExpired } = useDoma()

  // Poll for offer status updates
  useEffect(() => {
    if (!offerId) return

    const interval = setInterval(async () => {
      try {
        // Check if offer is still active
        const isActive = await isOfferActive(offerId, domainId, true)
        if (isActive) {
          setOfferStatus('submitted')
          return
        }
        
        // Check if offer is expired
        const isExpired = await isOfferExpired(offerId, domainId, true)
        if (isExpired) {
          setOfferStatus('expired')
          return
        }
        
        // Note: For accepted offers, we would need to check purchase events or activities
        // This would require implementing additional methods to check for purchase events
      } catch (error) {
        console.error('Failed to poll offer status:', error)
      }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [offerId, domainId, isOfferActive, isOfferExpired])

  const handleSubmitOffer = async () => {
    if (!amount || !address) return

    try {
      setLoading(true)
      setOfferStatus('pending')
      
      // Create on-chain offer using Doma's Orderbook API
      const response = await createOffer(domainId, amount)
      
      // Extract offer ID from response
      const newOfferId = response?.id || response?.orderId || null
      if (newOfferId) {
        setOfferId(newOfferId)
        setOfferStatus('submitted')
      }
      
      // Send message to chat with offer details
      const offerMessage = `💰 Made an offer of ${amount} ETH${message ? `
${message}` : ''}${newOfferId ? `

Offer ID: ${newOfferId.substring(0, 8)}...` : ''}`
      await onOfferMade(offerMessage)
      
      // Reset form
      setAmount('')
      setMessage('')
      setIsOpen(false)
      
      // Show success message
      alert('Offer submitted successfully!')
    } catch (error: any) {
      console.error('Failed to submit offer:', error)
      setOfferStatus(null)
      alert(`Failed to submit offer: ${error.message || 'Please try again.'}`)
    } finally {
      setLoading(false)
    }
  }

  const getStatusMessage = () => {
    switch (offerStatus) {
      case 'pending':
        return 'Submitting offer...'
      case 'submitted':
        return 'Offer submitted - waiting for response'
      case 'accepted':
        return '🎉 Offer accepted!'
      case 'rejected':
        return 'Offer rejected'
      case 'expired':
        return 'Offer expired'
      default:
        return ''
    }
  }

  if (!address) {
    return (
      <div className="text-center p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Connect wallet to make offers</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {!isOpen ? (
        <div className="space-y-2">
          <button
            onClick={() => setIsOpen(true)}
            className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            <span>💰</span>
            <span>Make an Offer</span>
          </button>
          {offerStatus && (
            <div className={`text-center text-sm p-2 rounded ${
              offerStatus === 'accepted' ? 'bg-green-100 text-green-800' :
              offerStatus === 'rejected' || offerStatus === 'expired' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {getStatusMessage()}
              {offerId && (
                <div className="text-xs mt-1">
                  Offer ID: {offerId.substring(0, 8)}...
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-green-800">Make an Offer</h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-green-600 hover:text-green-800"
            >
              ✕
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">
              Offer Amount (ETH)
            </label>
            <input
              type="number"
              step="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.1"
              className="w-full px-3 py-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a note with your offer..."
              className="w-full px-3 py-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 h-20 resize-none"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 border border-green-300 text-green-700 rounded hover:bg-green-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitOffer}
              disabled={!amount || loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Offer'}
            </button>
          </div>
          
          {offerStatus && (
            <div className={`text-center text-sm p-2 rounded ${
              offerStatus === 'accepted' ? 'bg-green-100 text-green-800' :
              offerStatus === 'rejected' || offerStatus === 'expired' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {getStatusMessage()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
