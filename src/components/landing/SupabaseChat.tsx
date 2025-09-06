// src/components/landing/SupabaseChat.tsx
'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useRealtimeChat } from '@/hooks/useRealTimeChat'
import { ChatMessage as PrismaChatMessage } from '@prisma/client'
import { formatAddress } from '@/lib/utils'

interface SupabaseChatProps {
  domainId: string
  ownerAddress: string
  domainName: string
}

// Helper to format timestamp
const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function SupabaseChat({ domainId, ownerAddress, domainName }: SupabaseChatProps) {
  const { address, isConnected } = useAccount()
  const { messages, isLoading, sendMessage } = useRealtimeChat(domainId, ownerAddress)
  
  const [newMessage, setNewMessage] = useState('')
  const [showOfferForm, setShowOfferForm] = useState(false)
  const [offerAmount, setOfferAmount] = useState('')
  const [offerMessage, setOfferMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // If user is not connected, show connect prompt
  if (!isConnected) {
    return (
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Chat with Domain Owner</h3>
        <p className="text-gray-600 mb-4">
          Connect your wallet to start a conversation with the owner of <strong>{domainName}</strong>.
        </p>
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 mb-4">
            Owner: {formatAddress(ownerAddress)}
          </p>
          <button 
            onClick={() => document.getElementById('connect-wallet-button')?.click()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  // If chat is initializing
  if (isLoading) {
    return (
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Chat with Domain Owner</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Initializing chat...</span>
        </div>
      </div>
    )
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !address) return

    try {
      setIsSending(true)
      setError(null)
      await sendMessage(newMessage, 'text')
      setNewMessage('')
    } catch (err) {
      console.error('Failed to send message:', err)
      setError('Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const handleMakeOffer = async () => {
    if (!offerAmount || !offerMessage.trim() || !address) return

    try {
      setIsSending(true)
      setError(null)
      
      // Create offer message
      const offerContent = `💰 OFFER: ${offerAmount} ETH - ${offerMessage}`
      await sendMessage(offerContent, 'offer')
      
      // Reset offer form
      setOfferAmount('')
      setOfferMessage('')
      setShowOfferForm(false)
      
      // Note: Success message will be displayed automatically through the real-time subscription
    } catch (err) {
      console.error('Failed to make offer:', err)
      setError('Failed to submit offer. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b">
        <h3 className="font-semibold">Chat with Domain Owner</h3>
        <p className="text-sm text-gray-600">
          Owner: {formatAddress(ownerAddress)}
        </p>
      </div>
      
      <div className="h-96 flex flex-col">
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              // Check if it's a system message
              const isSystemMessage = message.messageType === 'system'
              const isOfferMessage = message.messageType === 'offer'
              const isOwnMessage = message.senderAddress.toLowerCase() === address?.toLowerCase()
              
              return (
                <div 
                  key={message.id} 
                  className={`flex ${isSystemMessage ? 'justify-center' : isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isSystemMessage 
                        ? 'bg-yellow-100 text-yellow-800 text-sm' 
                        : isOfferMessage
                          ? 'bg-green-50 border border-green-200'
                          : isOwnMessage 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="text-sm">
                      {isSystemMessage ? (
                        <span className="font-medium">SYSTEM: </span>
                      ) : null}
                      {message.content}
                    </div>
                    {!isSystemMessage && (
                      <div className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.sentAt)}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
        
        {/* Message input */}
        <div className="border-t p-4">
          {error && (
            <div className="text-red-500 text-sm mb-2">{error}</div>
          )}
          {showOfferForm ? (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Make an Offer</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Amount (ETH)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Message</label>
                  <input
                    type="text"
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Your offer message"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleMakeOffer}
                  disabled={!offerAmount || !offerMessage.trim() || isSending}
                  className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? 'Submitting...' : 'Submit Offer'}
                </button>
                <button
                  onClick={() => setShowOfferForm(false)}
                  className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-2">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm resize-none h-12"
                disabled={isSending}
              />
              <div className="flex flex-col space-y-2">
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? 'Sending...' : 'Send'}
                </button>
                <button
                  onClick={() => setShowOfferForm(true)}
                  className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-green-700"
                >
                  Make Offer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}