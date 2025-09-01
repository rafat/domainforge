// src/hooks/useXMTP.ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Client, Conversation, DecodedMessage } from '@xmtp/xmtp-js'
import { useAccount, useWalletClient } from 'wagmi'
import { ethers } from 'ethers'

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

  const createConversation = async (peerAddress: string) => {
    if (!client) {
      throw new Error('XMTP client not initialized')
    }
    
    try {
      const conversation = await client.conversations.newConversation(peerAddress)
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

  const sendMessage = async (conversation: Conversation, content: string) => {
    if (!conversation || !content.trim()) return
    
    try {
      setIsSending(true)
      const sentMessage = await conversation.send(content.trim())
      return sentMessage
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    } finally {
      setIsSending(false)
    }
  }

  const streamMessages = async (conversation: Conversation, onMessage: (message: DecodedMessage) => void) => {
    if (!conversation || streaming) return
    
    try {
      setStreaming(true)
      for await (const message of await conversation.streamMessages()) {
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
    isConnected: !!client
  }
}
