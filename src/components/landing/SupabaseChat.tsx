'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useRealtimeChat } from '@/hooks/useRealTimeChat'
import { ChatMessage as PrismaChatMessage, ChatConversation, Domain } from '@prisma/client'
import { formatAddress } from '@/lib/utils'

interface SupabaseChatProps {
  domainId: string // This should be the Prisma `id`, not `tokenId`
  ownerAddress: string
  domainName: string
}

type ConversationWithDetails = ChatConversation & {
  messages: PrismaChatMessage[];
}

// Sub-component for the actual chat interface (reused by both buyer and owner)
function ChatInterface({
  messages,
  isLoading,
  onSendMessage,
  currentUserAddress,
  domainId,
  ownerAddress,
  isOwner,
}: {
  messages: PrismaChatMessage[],
  isLoading: boolean,
  onSendMessage: (content: string, type: 'text' | 'offer' | 'system') => Promise<void>,
  currentUserAddress: string,
  domainId: string,
  ownerAddress: string,
  isOwner: boolean,
}) {
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showOfferForm, setShowOfferForm] = useState(false)
  const [offerAmount, setOfferAmount] = useState('')
  const [offerMessage, setOfferMessage] = useState('')

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return
    setIsSending(true)
    await onSendMessage(newMessage, 'text')
    setNewMessage('')
    setIsSending(false)
  }

  const handleSendOffer = async () => {
    if (!offerAmount || parseFloat(offerAmount) <= 0) return
    
    setIsSending(true)
    try {
      // Create offer message content
      const offerContent = `💰 New offer: ${offerAmount} ETH${offerMessage ? `\n${offerMessage}` : ''}`
      await onSendMessage(offerContent, 'offer')
      
      // Reset offer form
      setOfferAmount('')
      setOfferMessage('')
      setShowOfferForm(false)
    } catch (error) {
      console.error('Failed to send offer:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleAcceptOffer = async (messageId: string) => {
    if (!isOwner) return
    
    try {
      // Send a system message indicating the offer is being processed
      const processingMessage = `✅ Offer accepted! Processing transaction...`
      await onSendMessage(processingMessage, 'system')
      
      // In a real implementation, you would:
      // 1. Extract offer details from the message (amount, buyer address, etc.)
      // 2. Call Doma's API to create an actual on-chain offer
      // 3. Update the domain ownership in the database
      // 4. Notify both parties
      
      // For now, we'll simulate the process with a delay
      setTimeout(async () => {
        const successMessage = `🎉 Transaction completed! Domain ownership transferred.`
        await onSendMessage(successMessage, 'system')
      }, 3000)
    } catch (error) {
      console.error('Failed to accept offer:', error)
      const errorMessage = `❌ Failed to process offer: ${error instanceof Error ? error.message : 'Unknown error'}`
      await onSendMessage(errorMessage, 'system')
    }
  }

  const handleRejectOffer = async (messageId: string) => {
    if (!isOwner) return
    
    try {
      // Send a system message indicating the offer has been rejected
      const rejectMessage = `❌ Offer rejected by owner`
      await onSendMessage(rejectMessage, 'system')
      
      // In a real implementation, you would:
      // 1. Extract offer details from the message
      // 2. Call Doma's API to reject the offer (if there's an on-chain component)
      // 3. Update the offer status in the database
      // 4. Notify the buyer
    } catch (error) {
      console.error('Failed to reject offer:', error)
      const errorMessage = `❌ Failed to reject offer: ${error instanceof Error ? error.message : 'Unknown error'}`
      await onSendMessage(errorMessage, 'system')
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.senderAddress.toLowerCase() === currentUserAddress.toLowerCase()
            const isOfferMessage = msg.messageType === 'offer'
            const isSystemMessage = msg.messageType === 'system'
            
            // Check if this is an offer message and extract offer details
            let offerAmount = ''
            if (isOfferMessage) {
              const match = msg.content.match(/💰 New offer: ([\d.]+) ETH/)
              if (match) {
                offerAmount = match[1]
              }
            }
            
            return (
              <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwnMessage ? 'bg-blue-600 text-white' : 
                  isOfferMessage ? 'bg-green-50 border border-green-200' : 
                  isSystemMessage ? 'bg-blue-50 border border-blue-200' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {isOfferMessage ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">💰</span>
                        <span className={isOwnMessage ? 'text-white' : 'text-green-800'}>
                          Offer: {offerAmount} ETH
                        </span>
                      </div>
                      {msg.content.includes('') && (
                        <p className={isOwnMessage ? 'text-white' : 'text-gray-700'}>
                          {msg.content.split('')[1]}
                        </p>
                      )}
                      {!isOwnMessage && isOwner && (
                        <div className="flex space-x-2 pt-2">
                          <button
                            onClick={() => handleAcceptOffer(msg.id)}
                            className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectOffer(msg.id)}
                            className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      <p className={`text-xs ${isOwnMessage ? 'text-blue-200' : 'text-gray-500'}`}>
                        {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className={`text-sm ${isSystemMessage ? 'text-blue-800' : isOwnMessage ? 'text-white' : 'text-gray-800'}`}>
                        {msg.content}
                      </p>
                      <p className={`text-xs mt-1 text-right ${isOwnMessage ? 'text-blue-200' : 'text-gray-500'}`}>
                        {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
      
      {/* Offer Form Modal */}
      {showOfferForm && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Make an Offer</h3>
              <button 
                onClick={() => setShowOfferForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Offer Amount (ETH)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  placeholder="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (optional)
                </label>
                <textarea
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  placeholder="Add a note with your offer..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowOfferForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendOffer}
                  disabled={!offerAmount || parseFloat(offerAmount) <= 0 || isSending}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isSending ? 'Sending...' : 'Send Offer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="border-t p-4 space-y-3">
        {!isOwner && (
          <button
            onClick={() => setShowOfferForm(true)}
            className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
          >
            <span>💰</span>
            <span>Make an Offer</span>
          </button>
        )}
        
        <div className="flex space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm resize-none"
            disabled={isSending}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}


export function SupabaseChat({ domainId, ownerAddress, domainName }: SupabaseChatProps) {
  const { address: currentUserAddress, isConnected } = useAccount()
  const isOwner = isConnected && currentUserAddress?.toLowerCase() === ownerAddress.toLowerCase()

  // State for the Owner's Inbox View
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [selectedConvo, setSelectedConvo] = useState<ConversationWithDetails | null>(null)
  const [isInboxLoading, setIsInboxLoading] = useState(true)

  // Fetch all conversations if the current user is the owner
  useEffect(() => {
    if (isOwner) {
      const fetchConversations = async () => {
        setIsInboxLoading(true)
        try {
          const res = await fetch(`/api/chat/conversations-for-domain?domainId=${domainId}`)
          const data = await res.json()
          setConversations(data)
        } catch (error) {
          console.error("Failed to fetch owner conversations", error)
        } finally {
          setIsInboxLoading(false)
        }
      }
      fetchConversations()
    }
  }, [isOwner, domainId])

  // --- BUYER'S VIEW LOGIC ---
  // The buyer only needs to manage one conversation: their own.
  function BuyerView() {
    const { messages, isLoading, sendMessage } = useRealtimeChat(domainId, currentUserAddress, ownerAddress)
    return (
      <ChatInterface 
        messages={messages} 
        isLoading={isLoading} 
        onSendMessage={sendMessage} 
        currentUserAddress={currentUserAddress!}
        domainId={domainId}
        ownerAddress={ownerAddress}
        isOwner={false}
      />
    )
  }

  // --- OWNER'S VIEW LOGIC ---
  // The owner sees a list of conversations and can select one to chat in.
  function OwnerView() {
    const selectedBuyerAddress = selectedConvo?.buyerAddress
    const { messages, isLoading, sendMessage } = useRealtimeChat(domainId, selectedBuyerAddress, ownerAddress)

    return (
      <div className="h-full flex">
        <div className="w-1/3 border-r overflow-y-auto">
          <h4 className="font-bold p-3 border-b">Conversations</h4>
          {isInboxLoading ? (
             <p className="p-3 text-gray-500">Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="p-3 text-gray-500">No conversations yet.</p>
          ) : (
            conversations.map(convo => (
              <div
                key={convo.id}
                onClick={() => setSelectedConvo(convo)}
                className={`p-3 cursor-pointer hover:bg-gray-100 ${selectedConvo?.id === convo.id ? 'bg-blue-50' : ''}`}
              >
                <p className="font-semibold text-sm">From: {formatAddress(convo.buyerAddress)}</p>
                <p className="text-xs text-gray-500 truncate">{convo.messages[0]?.content || '...'}</p>
              </div>
            ))
          )}
        </div>
        <div className="w-2/3">
          {selectedConvo ? (
            <ChatInterface 
              messages={messages} 
              isLoading={isLoading} 
              onSendMessage={sendMessage} 
              currentUserAddress={currentUserAddress!}
              domainId={domainId}
              ownerAddress={ownerAddress}
              isOwner={true}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">Select a conversation to view.</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // --- MAIN RENDER LOGIC ---
  if (!isConnected) {
    return (
      <div className="bg-white border rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold mb-4">Chat with Owner</h3>
        <p className="text-gray-600 mb-4">Connect your wallet to start a conversation or view your messages.</p>
        {/* You should have a global connect button, or add one here */}
      </div>
    )
  }

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b">
        <h3 className="font-semibold">
          {isOwner ? `Your Inbox for ${domainName}` : `Chat about ${domainName}`}
        </h3>
        <p className="text-sm text-gray-600">
          Owner: {formatAddress(ownerAddress)}
        </p>
      </div>
      <div className="h-96">
        {isOwner ? <OwnerView /> : <BuyerView />}
      </div>
    </div>
  )
}