// src/hooks/useXMTP.ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Client, Conversation, DecodedMessage } from '@xmtp/xmtp-js'
import { useAccount, useWalletClient } from 'wagmi'
import { ethers } from 'ethers'
import { chatPersistenceService } from '@/lib/chatPersistenceService'

export function useXMTP() {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [streaming, setStreaming] = useState(false)

  const initializeClient = useCallback(async () => {
    if (!walletClient || !address) return
    
    try {
      setIsLoading(true)
      
      // Create XMTP client using ethers provider
      const provider = new ethers.BrowserProvider(walletClient)
      const xmtpClient = await Client.create(provider, { 
        env: 'dev' // Use 'production' for mainnet
      })
      
      setClient(xmtpClient)
      
      // Load conversations
      const convos = await xmtpClient.conversations.list()
      setConversations(convos)
    } catch (error) {
      console.error('Failed to initialize XMTP client:', error)
    } finally {
      setIsLoading(false)
    }
  }, [walletClient, address])

  useEffect(() => {
    if (address && walletClient) {
      initializeClient()
    }
  }, [address, walletClient, initializeClient])

  const createConversation = async (peerAddress: string, domainId?: string) => {
    if (!client || !address) {
      throw new Error('XMTP client not initialized')
    }
    
    try {
      const conversation = await client.conversations.newConversation(peerAddress)
      
      // If we have domainId, create persistent conversation record
      if (domainId) {
        await chatPersistenceService.getOrCreateConversation(
          domainId,
          address.toLowerCase(),
          peerAddress.toLowerCase(),
          conversation.topic
        )
      }
      
      setConversations(prev => [...prev, conversation])
      return conversation
    } catch (error) {
      console.error('Failed to create conversation:', error)
      throw error
    }
  }

  const getMessages = async (conversation: Conversation) => {
    if (!conversation) return []
    
    try {
      return await conversation.messages()
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      return []
    }
  }

  const sendMessage = async (conversation: Conversation, content: string, domainId?: string) => {
    if (!conversation || !content.trim() || !address) return
    
    try {
      setIsSending(true)
      const sentMessage = await conversation.send(content.trim())
      
      // Save message to persistent storage if we have domainId
      if (domainId) {
        const convRecord = await chatPersistenceService.getOrCreateConversation(
          domainId,
          address.toLowerCase(),
          conversation.peerAddress.toLowerCase(),
          conversation.topic
        )
        
        await chatPersistenceService.saveMessage(convRecord.id, sentMessage)
      }
      
      return sentMessage
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    } finally {
      setIsSending(false)
    }
  }

  const streamMessages = async (
    conversation: Conversation, 
    onMessage: (message: DecodedMessage) => void,
    domainId?: string
  ) => {
    if (!conversation || streaming) return
    
    try {
      setStreaming(true)
      for await (const message of await conversation.streamMessages()) {
        // Save incoming message to persistent storage if we have domainId
        if (domainId && message.senderAddress !== address) {
          const convRecord = await chatPersistenceService.getOrCreateConversation(
            domainId,
            address ? address.toLowerCase() : '',
            conversation.peerAddress.toLowerCase(),
            conversation.topic
          )
          
          await chatPersistenceService.saveMessage(convRecord.id, message)
        }
        
        onMessage(message)
      }
    } catch (error) {
      console.error('Failed to stream messages:', error)
    } finally {
      setStreaming(false)
    }
  }

  const listConversations = async () => {
    if (!client) return []
    
    try {
      const convos = await client.conversations.list()
      setConversations(convos)
      return convos
    } catch (error) {
      console.error('Failed to list conversations:', error)
      return []
    }
  }

  // Load persistent messages for a conversation
  const loadPersistentMessages = async (conversationId: string, limit: number = 50, offset: number = 0) => {
    try {
      const messages = await chatPersistenceService.getMessages(conversationId, limit, offset)
      return messages
    } catch (error) {
      console.error('Failed to load persistent messages:', error)
      return []
    }
  }

  // Mark messages as read
  const markMessagesAsRead = async (conversationId: string, beforeDate: Date) => {
    try {
      await chatPersistenceService.markMessagesAsRead(conversationId, beforeDate)
    } catch (error) {
      console.error('Failed to mark messages as read:', error)
    }
  }

  return {
    client,
    isLoading,
    isSending,
    conversations,
    streaming,
    createConversation,
    getMessages,
    sendMessage,
    streamMessages,
    listConversations,
    loadPersistentMessages,
    markMessagesAsRead,
    isConnected: !!client
  }
}
