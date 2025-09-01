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
    streamMessages 
  } = useXMTP()
  
  const [conversation, setConversation] = useState<any>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [streamingError, setStreamingError] = useState<string | null>(null)

  const convertXMTPMessage = (msg: DecodedMessage): ChatMessage => {
    return {
      id: msg.id,
      content: msg.content(),
      sender: msg.senderAddress,
      timestamp: msg.sent,
      messageType: 'text'
    }
  }

  const initializeConversation = useCallback(async () => {
    if (!client || !address || !ownerAddress) return

    try {
      // Create or get existing conversation
      const conv = await createConversation(ownerAddress)
      setConversation(conv)
      
      // Load existing messages
      const msgs = await getMessages(conv)
      const chatMessages = msgs.map(convertXMTPMessage)
      setMessages(chatMessages)
      
      // Start streaming new messages
      setStreamingError(null)
      await streamMessages(conv, (newMessage) => {
        const chatMessage = convertXMTPMessage(newMessage)
        setMessages(prev => [...prev, chatMessage])
      })
    } catch (error: any) {
      console.error('Failed to initialize conversation:', error)
      setStreamingError(error.message || 'Failed to start chat')
    }
  }, [client, address, ownerAddress, createConversation, getMessages, streamMessages])

  useEffect(() => {
    if (client && address && ownerAddress && isOpen) {
      initializeConversation()
    }
  }, [client, address, ownerAddress, isOpen, initializeConversation])

  const handleSendMessage = async (content: string) => {
    if (!conversation || !content.trim()) return
    
    try {
      await sendMessage(conversation, content.trim())
      // The message will be added to the UI via the stream
    } catch (error: any) {
      console.error('Failed to send message:', error)
      alert('Failed to send message: ' + (error.message || 'Unknown error'))
    }
  }

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
