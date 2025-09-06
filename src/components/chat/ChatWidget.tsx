'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { useRealtimeChat } from '@/hooks/useRealTimeChat' // <-- CORE CHANGE: Using our new hook
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { OfferButton } from './OfferButton'
import { ChatMessage } from '@/types/chat' // Your custom frontend chat type
import { offerNotificationService } from '@/lib/offerNotificationService'
import { DomaEvent } from '@/types/domaEvents'
import { ChatMessage as PrismaChatMessage } from '@prisma/client'

interface ChatWidgetProps {
  domainId: string
  ownerAddress: string
}

// Helper to convert Prisma messages from the DB into the format our UI components expect.
// This is good practice for decoupling your backend schema from your frontend components.
const adaptPrismaMessage = (msg: PrismaChatMessage): ChatMessage => ({
  id: msg.id,
  content: msg.content,
  sender: msg.senderAddress,
  timestamp: msg.sentAt, // Prisma's `sentAt` becomes our generic `timestamp`
  messageType: msg.messageType as 'text' | 'offer' | 'system',
})

// Helper to create a user-friendly message from a Doma event
const getEventMessage = (event: DomaEvent): string => {
  switch (event.type) {
    case 'NAME_OFFER_MADE':
      return `New offer received for ${event.data?.name || 'this domain'}: ${
        event.data?.amount || 'N/A'
      } ${event.data?.currency || 'ETH'}`
    case 'NAME_PURCHASED':
      return `Domain purchased for ${event.data?.price || 'N/A'} ${event.data?.currency || 'ETH'}`
    case 'NAME_CANCELLED':
      return `Offer cancelled for ${event.data?.name || 'this domain'}`
    default:
      return `New event: ${event.type}`
  }
}

export function ChatWidget({ domainId, ownerAddress }: ChatWidgetProps) {
  const { address } = useAccount()
  
  // --- CORE CHANGE: All chat logic is now handled by this single, simple hook ---
  const { messages: prismaMessages, isLoading, sendMessage } = useRealtimeChat(domainId, ownerAddress)

  const [allMessages, setAllMessages] = useState<ChatMessage[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0) // Kept for future UI features

  // This function handles injecting non-chat "system" messages into the UI
  const handleOfferEvent = useCallback((event: DomaEvent) => {
    const systemMessage: ChatMessage = {
      id: `system-${event.id}`,
      content: `🔔 ${getEventMessage(event)}`,
      sender: 'system',
      timestamp: new Date(event.timestamp),
      messageType: 'system',
    }
    setAllMessages(prev => [...prev, systemMessage])
  }, [])

  // This effect combines the messages from our database with any real-time system messages
  useEffect(() => {
    const adaptedChatMessages = prismaMessages.map(adaptPrismaMessage)
    // Here you could merge adaptedChatMessages with other system notifications if needed
    // For now, we'll just use the adapted messages and let handleOfferEvent add to the list
    const sortedMessages = [...adaptedChatMessages].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    setAllMessages(sortedMessages)
  }, [prismaMessages])

  // This logic for subscribing to non-chat events (like offers) is unchanged
  useEffect(() => {
    if (!isOpen) return
    const unsubscribe = offerNotificationService.subscribeToOfferEvents(domainId, handleOfferEvent)
    return () => unsubscribe()
  }, [isOpen, domainId, handleOfferEvent])

  // The new sendMessage is much simpler. It just sends the text to the hook.
  // The UI will update automatically when the real-time listener gets the new message.
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return
    try {
      await sendMessage(content, 'text')
    } catch (error: any) {
      console.error('Failed to send message:', error)
      alert('Failed to send message: ' + (error.message || 'Unknown error'))
    }
  }
  
  // UI LOGIC (largely unchanged)

  if (!address) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg">
        <p className="text-center text-gray-600">
          Connect your wallet to start a conversation with the owner.
        </p>
      </div>
    )
  }

  if (isLoading && !allMessages.length) {
    return (
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="p-4 border-b bg-blue-50">
          <h3 className="font-medium">💬 Chat with Owner</h3>
        </div>
        <div className="p-6 flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading conversation...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      <div
        className="p-4 border-b cursor-pointer bg-blue-50 flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-medium flex items-center">
          💬 Chat with Owner
          {unreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </h3>
        <span className="text-2xl font-light text-gray-500">
          {isOpen ? '−' : '+'}
        </span>
      </div>

      {isOpen && (
        <div className="h-96 flex flex-col">
          <MessageList messages={allMessages} currentUser={address} />
          <div className="p-4 border-t space-y-3 bg-gray-50">
            <OfferButton domainId={domainId} onOfferMade={handleSendMessage} />
            <MessageInput onSend={handleSendMessage} />
          </div>
        </div>
      )}
    </div>
  )
}