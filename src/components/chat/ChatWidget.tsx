// src/components/chat/ChatWidget.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { useXMTP } from '@/hooks/useXMTP'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { OfferButton } from './OfferButton'
import { DecodedMessage } from '@xmtp/xmtp-js'
import { Message as ChatMessage } from '@/types/chat'
import { offerNotificationService } from '@/lib/offerNotificationService'
import { DomaEvent } from '@/types/domaEvents'

interface ChatWidgetProps {
  domainId: string
  ownerAddress: string
}

export function ChatWidget({ domainId, ownerAddress }: ChatWidgetProps) {
  const { address } = useAccount()
  const { 
    client, 
    isLoading, 
    createConversation, 
    getMessages, 
    sendMessage, 
    streamMessages,
    loadPersistentMessages,
    markMessagesAsRead
  } = useXMTP()
  
  const [conversation, setConversation] = useState<any>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [streamingError, setStreamingError] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<DomaEvent[]>([])
  const [persistentConversationId, setPersistentConversationId] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState<number>(0)

  const convertXMTPMessage = (msg: DecodedMessage): ChatMessage => {
    return {
      id: msg.id,
      content: msg.content(),
      sender: msg.senderAddress,
      timestamp: msg.sent,
      messageType: 'text'
    }
  }

  // Handle offer events from Poll API
  const handleOfferEvent = useCallback((event: DomaEvent) => {
    console.log('Received offer event:', event)
    
    // Add to notifications
    setNotifications(prev => [...prev, event])
    
    // Create a system message for the chat
    const systemMessage: ChatMessage = {
      id: `system-${event.id}`,
      content: `🔔 ${getEventMessage(event)}`,
      sender: 'system',
      timestamp: new Date(event.timestamp),
      messageType: 'system'
    }
    
    setMessages(prev => [...prev, systemMessage])
  }, [])

  // Get human-readable message for an event
  const getEventMessage = (event: DomaEvent): string => {
    switch (event.type) {
      case 'NAME_OFFER_MADE':
        return `New offer received for ${event.data?.name || 'this domain'}: ${event.data?.amount || 'N/A'} ${event.data?.currency || 'ETH'}`
      case 'NAME_PURCHASED':
        return `Domain purchased for ${event.data?.price || 'N/A'} ${event.data?.currency || 'ETH'}`
      case 'NAME_CANCELLED':
        return `Offer cancelled for ${event.data?.name || 'this domain'}`
      default:
        return `New event: ${event.type}`
    }
  }

  const initializeConversation = useCallback(async () => {
    if (!client || !address || !ownerAddress) return

    try {
      // Create or get existing conversation with persistent storage
      const conv = await createConversation(ownerAddress, domainId)
      setConversation(conv)
      
      // Load existing XMTP messages
      const xmtpMsgs = await getMessages(conv)
      const xmtpChatMessages = xmtpMsgs.map(convertXMTPMessage)
      
      // Load persistent messages from database
      if (persistentConversationId) {
        const persistentMsgs = await loadPersistentMessages(persistentConversationId, 50, 0)
        const persistentChatMessages = persistentMsgs.map(msg => ({
          id: msg.id,
          content: msg.content,
          sender: msg.senderAddress,
          timestamp: msg.sentAt,
          messageType: msg.messageType as 'text' | 'offer' | 'system'
        }))
        
        // Combine and deduplicate messages
        const allMessages = [...persistentChatMessages, ...xmtpChatMessages]
        const uniqueMessages = allMessages.filter((msg, index, self) => 
          index === self.findIndex(m => m.id === msg.id)
        )
        
        // Sort by timestamp
        uniqueMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        
        setMessages(uniqueMessages)
        
        // Mark messages as read
        if (uniqueMessages.length > 0) {
          const lastMessage = uniqueMessages[uniqueMessages.length - 1]
          await markMessagesAsRead(persistentConversationId, lastMessage.timestamp)
        }
      } else {
        setMessages(xmtpChatMessages)
      }
      
      // Start streaming new messages
      setStreamingError(null)
      await streamMessages(conv, (newMessage) => {
        const chatMessage = convertXMTPMessage(newMessage)
        setMessages(prev => [...prev, chatMessage])
      }, domainId) // Pass domainId for persistent storage
    } catch (error: any) {
      console.error('Failed to initialize conversation:', error)
      setStreamingError(error.message || 'Failed to start chat')
    }
  }, [client, address, ownerAddress, createConversation, getMessages, streamMessages, persistentConversationId, domainId, loadPersistentMessages, markMessagesAsRead])

  // Subscribe to offer events when chat is open
  useEffect(() => {
    if (!isOpen) return

    // Subscribe to offer events for this domain
    const unsubscribe = offerNotificationService.subscribeToOfferEvents(
      domainId,
      handleOfferEvent
    )

    return () => {
      unsubscribe()
    }
  }, [isOpen, domainId, handleOfferEvent])

  // Load persistent conversation when component mounts
  useEffect(() => {
    const loadPersistentConversation = async () => {
      if (!address || !domainId) return
      
      try {
        // In a real implementation, we would load the persistent conversation ID
        // For now, we'll set it to null to indicate we need to create one
        setPersistentConversationId(null)
      } catch (error) {
        console.error('Failed to load persistent conversation:', error)
      }
    }
    
    loadPersistentConversation()
  }, [address, domainId])

  useEffect(() => {
    if (client && address && ownerAddress && isOpen) {
      initializeConversation()
    }
  }, [client, address, ownerAddress, isOpen, initializeConversation])

  const handleSendMessage = async (content: string) => {
    if (!conversation || !content.trim()) return
    
    try {
      await sendMessage(conversation, content.trim(), domainId)
      // The message will be added to the UI via the stream
    } catch (error: any) {
      console.error('Failed to send message:', error)
      alert('Failed to send message: ' + (error.message || 'Unknown error'))
    }
  }

  // Clear notifications
  const clearNotifications = () => {
    setNotifications([])
  }

  // Mark conversation as read
  const markConversationAsRead = useCallback(async () => {
    if (persistentConversationId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      await markMessagesAsRead(persistentConversationId, lastMessage.timestamp)
      setUnreadCount(0)
    }
  }, [persistentConversationId, messages, markMessagesAsRead])

  // Effect to mark as read when chat opens
  useEffect(() => {
    if (isOpen) {
      markConversationAsRead()
    }
  }, [isOpen, markConversationAsRead])

  if (!address) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg">
        <p className="text-center text-gray-600">
          Connect your wallet to start a conversation with the owner
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="p-4 border-b bg-blue-50">
          <h3 className="font-medium flex items-center justify-between">
            💬 Chat with Owner
          </h3>
        </div>
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Initializing chat...</span>
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
          {(notifications.length > 0 || unreadCount > 0) && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notifications.length + unreadCount}
            </span>
          )}
        </h3>
        <span className="text-sm text-gray-500">
          {isOpen ? '−' : '+'}
        </span>
      </div>
      
      {isOpen && (
        <div className="flex flex-col">
          {streamingError && (
            <div className="p-3 bg-red-50 border-b border-red-200 text-red-700 text-sm">
              Error: {streamingError}
            </div>
          )}
          
          {notifications.length > 0 && (
            <div className="p-3 bg-blue-50 border-b border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-blue-800 font-medium">
                  {notifications.length} new notification{notifications.length !== 1 ? 's' : ''}
                </span>
                <button 
                  onClick={clearNotifications}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
          
          <div className="h-96 flex flex-col">
            <MessageList messages={messages} currentUser={address} />
            
            <div className="p-4 border-t space-y-3">
              <OfferButton domainId={domainId} onOfferMade={handleSendMessage} />
              <MessageInput onSend={handleSendMessage} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
