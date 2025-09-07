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
}: {
  messages: PrismaChatMessage[],
  isLoading: boolean,
  onSendMessage: (content: string, type: 'text' | 'offer') => Promise<void>,
  currentUserAddress: string
}) {
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return
    setIsSending(true)
    await onSendMessage(newMessage, 'text')
    setNewMessage('')
    setIsSending(false)
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
            return (
              <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwnMessage ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 text-right ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
      <div className="border-t p-4 flex space-x-2">
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
    return <ChatInterface messages={messages} isLoading={isLoading} onSendMessage={sendMessage} currentUserAddress={currentUserAddress!} />
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
            <ChatInterface messages={messages} isLoading={isLoading} onSendMessage={sendMessage} currentUserAddress={currentUserAddress!} />
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