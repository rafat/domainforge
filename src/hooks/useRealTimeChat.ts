'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { supabase } from '@/lib/supabase' // Your configured Supabase client
import { ChatMessage as PrismaChatMessage } from '@prisma/client'
import { RealtimeChannel } from '@supabase/supabase-js'

/**
 * A custom React hook to manage a real-time chat conversation for a specific domain.
 * It handles:
 *  - Creating or joining a conversation room.
 *  - Fetching historical messages.
 *  - Subscribing to new messages in real-time.
 *  - Sending new messages via a secure backend API.
 *
 * @param domainId The unique ID of the domain being discussed.
 * @param ownerAddress The wallet address of the domain owner (the seller).
 */
export function useRealtimeChat(domainId: string, ownerAddress: string) {
  const { address: buyerAddress } = useAccount()
  const [messages, setMessages] = useState<PrismaChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  const initializeConversation = useCallback(async () => {
    // Ensure we have all necessary info before proceeding
    if (!buyerAddress || !ownerAddress || !domainId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    
    try {
      // Step 1: Get or create the conversation "room" from our API.
      // This ensures we have a stable ID for fetching history and subscribing.
      const convResponse = await fetch('/api/chat/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainId, buyerAddress, sellerAddress: ownerAddress }),
      })

      if (!convResponse.ok) throw new Error('Failed to establish conversation.')
      
      const conversation = await convResponse.json()
      if (!conversation?.id) throw new Error('Invalid conversation response.')
      
      setConversationId(conversation.id)

      // Step 2: Fetch historical messages for this specific conversation room.
      const historyResponse = await fetch(`/api/chat/history?conversationId=${conversation.id}`)
      if (!historyResponse.ok) throw new Error('Failed to fetch chat history.')
      
      const historicalMessages: PrismaChatMessage[] = await historyResponse.json()
      setMessages(historicalMessages)

      // Step 3: Subscribe to NEW messages in real-time using Supabase's listener.
      // This listener is connected to our own PostgreSQL database.
      if (channel) {
          await supabase.removeChannel(channel); // Clean up previous subscription if it exists
      }

      const newChannel = supabase
        .channel(`chat_room:${conversation.id}`) // Create a unique channel for this conversation
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'chat_messages', 
            filter: `conversationId=eq.${conversation.id}` // IMPORTANT: Only listen for messages in THIS room
          }, 
          (payload) => {
            // When a new message is inserted in the DB, Supabase tells us in real-time.
            // We then add it to our local state to update the UI.
            setMessages((prevMessages) => [...prevMessages, payload.new as PrismaChatMessage])
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log(`Real-time chat enabled for conversation ${conversation.id}`)
            setIsLoading(false)
          }
          if (status === 'CHANNEL_ERROR') {
            console.error('Real-time channel error:', err)
          }
        })
      setChannel(newChannel);

    } catch (error) {
      console.error("Error initializing chat:", error)
      setIsLoading(false)
    }
  }, [buyerAddress, ownerAddress, domainId])

  // Effect to run the initialization logic and handle cleanup
  useEffect(() => {
    initializeConversation()
    
    // This cleanup function is crucial. It runs when the component unmounts.
    return () => {
      if (channel) {
        console.log(`Unsubscribing from channel: ${channel.topic}`)
        supabase.removeChannel(channel)
      }
    }
  }, [initializeConversation, channel]) // The dependency array is correct, but be mindful of re-renders if these props change often.

  /**
   * Sends a new message by posting it to our secure backend API.
   * The UI will update automatically via the real-time subscription, not from this function.
   * @param content The text content of the message.
   * @param messageType The type of message (e.g., 'text' or 'offer').
   */
  const sendMessage = async (content: string, messageType: 'text' | 'offer' = 'text') => {
    if (!buyerAddress || !content.trim() || !conversationId) return

    await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          conversationId, 
          senderAddress: buyerAddress, 
          content, 
          messageType 
        }),
    })
  }

  return { messages, isLoading, sendMessage }
}