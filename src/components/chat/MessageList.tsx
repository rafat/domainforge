// src/components/chat/MessageList.tsx
'use client'

import { Message } from '@/types/chat'
import { formatAddress, timeAgo } from '@/lib/utils'

interface MessageListProps {
  messages: Message[]
  currentUser: string
}

export function MessageList({ messages, currentUser }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            💬
          </div>
          <p>Start a conversation about this domain</p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((message, index) => (
        <MessageBubble
          key={index}
          message={message}
          isOwn={message.sender.toLowerCase() === currentUser?.toLowerCase()}
        />
      ))}
    </div>
  )
}
interface MessageBubbleProps {
  message: Message
  isOwn: boolean
}
function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const isOffer = message.messageType === 'offer'
  const isSystem = message.messageType === 'system'
  
  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="max-w-xs lg:max-w-md">
          <div className="px-4 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
            <div className="flex items-center space-x-2">
              <span>🔔</span>
              <span>{message.content}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-xs lg:max-w-md space-y-1">
        <div className={`flex items-center space-x-2 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {formatAddress(message.sender).slice(0, 2).toUpperCase()}
          </div>
          <span className="text-xs text-gray-500">
            {formatAddress(message.sender)}
          </span>
          <span className="text-xs text-gray-400">
            {timeAgo(message.timestamp)}
          </span>
        </div>
        
        <div className={`px-4 py-2 rounded-lg ${
          isOwn 
            ? 'bg-blue-600 text-white' 
            : isOffer
              ? 'bg-green-50 border border-green-200'
              : 'bg-gray-100'
        }`}>
          {isOffer && message.offerData ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">💰</span>
                <span className={isOwn ? 'text-white' : 'text-green-800'}>
                  Offer: {message.offerData.amount} {message.offerData.currency}
                </span>
              </div>
              {message.content && (
                <p className={isOwn ? 'text-white' : 'text-gray-700'}>
                  {message.content}
                </p>
              )}
              {message.offerData.expiry && (
                <p className={`text-xs ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                  Expires: {message.offerData.expiry.toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <p className={isOwn ? 'text-white' : 'text-gray-900'}>
              {message.content}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}