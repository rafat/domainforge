// src/types/chat.ts
export interface ChatMessage {
  id: string
  content: string
  sender: string
  timestamp: Date
  messageType: 'text' | 'offer' | 'system'
  offerData?: {
    amount: string
    currency: string
    expiry?: Date
  }
}

export interface Conversation {
  id: string
  participants: string[]
  domainId: string
  lastMessage?: ChatMessage
  createdAt: Date
  updatedAt: Date
}
