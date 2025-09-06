// src/lib/chatPersistenceService.ts
// Service for handling persistent chat conversations and messages

import { prisma } from './db'
import { ChatMessage as PrismaChatMessage } from '@prisma/client'

export class ChatPersistenceService {
  private static instance: ChatPersistenceService

  private constructor() {}

  static getInstance(): ChatPersistenceService {
    if (!ChatPersistenceService.instance) {
      ChatPersistenceService.instance = new ChatPersistenceService()
    }
    return ChatPersistenceService.instance
  }

  // Create or get existing conversation record
  async getOrCreateConversation(
    domainId: string,
    buyerAddress: string,
    sellerAddress: string,
    conversationId: string
  ) {
    try {
      // Check if conversation already exists
      let conversation = await prisma.chatConversation.findUnique({
        where: {
          xmtpConversationId: conversationId
        }
      })

      // If not found, create new conversation record
      if (!conversation) {
        conversation = await prisma.chatConversation.create({
          data: {
            domainId: domainId,
            buyerAddress: buyerAddress.toLowerCase(),
            sellerAddress: sellerAddress.toLowerCase(),
            xmtpConversationId: conversationId
          }
        })
      }

      return conversation
    } catch (error) {
      console.error('Failed to get or create conversation:', error)
      throw error
    }
  }

  // Save a message to the database
  async saveMessage(
    conversationId: string,
    senderAddress: string,
    content: string,
    messageType: string = 'text'
  ): Promise<PrismaChatMessage | null> {
    try {
      // Create new message record
      const message = await prisma.chatMessage.create({
        data: {
          conversationId: conversationId,
          senderAddress: senderAddress.toLowerCase(),
          content: content,
          messageType: messageType,
          sentAt: new Date()
        }
      })

      // Update conversation's last message timestamp
      await prisma.chatConversation.update({
        where: {
          id: conversationId
        },
        data: {
          lastMessageAt: new Date()
        }
      })

      return message
    } catch (error) {
      console.error('Failed to save message:', error)
      return null
    }
  }

  // Get messages for a conversation
  async getMessages(conversationId: string, limit: number = 50, offset: number = 0) {
    try {
      const messages = await prisma.chatMessage.findMany({
        where: {
          conversationId: conversationId
        },
        orderBy: {
          sentAt: 'asc'
        },
        take: limit,
        skip: offset
      })

      return messages
    } catch (error) {
      console.error('Failed to get messages:', error)
      return []
    }
  }

  // Mark messages as delivered
  async markMessagesAsDelivered(conversationId: string, beforeDate: Date) {
    try {
      const result = await prisma.chatMessage.updateMany({
        where: {
          conversationId: conversationId,
          sentAt: {
            lte: beforeDate
          },
          deliveredAt: null
        },
        data: {
          deliveredAt: new Date()
        }
      })

      return result
    } catch (error) {
      console.error('Failed to mark messages as delivered:', error)
      return { count: 0 }
    }
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId: string, beforeDate: Date) {
    try {
      const result = await prisma.chatMessage.updateMany({
        where: {
          conversationId: conversationId,
          sentAt: {
            lte: beforeDate
          },
          readAt: null
        },
        data: {
          readAt: new Date()
        }
      })

      return result
    } catch (error) {
      console.error('Failed to mark messages as read:', error)
      return { count: 0 }
    }
  }

  // Get conversation history for a domain
  async getConversationHistory(domainId: string, userAddress: string) {
    try {
      const conversations = await prisma.chatConversation.findMany({
        where: {
          domainId: domainId,
          OR: [
            {
              buyerAddress: userAddress.toLowerCase()
            },
            {
              sellerAddress: userAddress.toLowerCase()
            }
          ]
        },
        orderBy: {
          lastMessageAt: 'desc'
        },
        include: {
          messages: {
            orderBy: {
              sentAt: 'asc'
            },
            take: 20 // Limit to last 20 messages per conversation
          }
        }
      })

      return conversations
    } catch (error) {
      console.error('Failed to get conversation history:', error)
      return []
    }
  }

  // Get unread message count for a user
  async getUnreadMessageCount(userAddress: string) {
    try {
      const count = await prisma.chatMessage.count({
        where: {
          conversation: {
            OR: [
              {
                buyerAddress: userAddress.toLowerCase()
              },
              {
                sellerAddress: userAddress.toLowerCase()
              }
            ]
          },
          senderAddress: {
            not: userAddress.toLowerCase()
          },
          readAt: null
        }
      })

      return count
    } catch (error) {
      console.error('Failed to get unread message count:', error)
      return 0
    }
  }
}

// Export singleton instance
export const chatPersistenceService = ChatPersistenceService.getInstance()