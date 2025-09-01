// src/components/chat/OfferButton.tsx
'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useDoma } from '@/hooks/useDoma'

interface OfferButtonProps {
  domainId: string
  onOfferMade: (message: string) => void
}

export function OfferButton({ domainId, onOfferMade }: OfferButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { address } = useAccount()
  const { createOffer } = useDoma()

  const handleSubmitOffer = async () => {
    if (!amount || !address) return

    try {
      setLoading(true)
      
      // Create on-chain offer
      const tx = await createOffer(domainId, amount)
      
      // Send message to chat
      const offerMessage = `💰 Made an offer of ${amount} ETH${message ? `\n\n${message}` : ''}`
      await onOfferMade(offerMessage)
      
      // Reset form
      setAmount('')
      setMessage('')
      setIsOpen(false)
      
      // Show success message
      alert('Offer submitted successfully!')
    } catch (error) {
      console.error('Failed to submit offer:', error)
      alert('Failed to submit offer. Please try again.')
    } finally {
      setLoading(false)
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
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
        >
          <span>💰</span>
          <span>Make an Offer</span>
        </button>
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
        </div>
      )}
    </div>
  )
}
