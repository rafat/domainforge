'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { supabase } from '@/lib/supabase'
import { ChatMessage as PrismaChatMessage } from '@prisma/client'
import { RealtimeChannel } from '@supabase/supabase-js'

/**
 * A custom hook to manage a SINGLE real-time chat conversation.
 * It is now role-agnostic and relies on the parent component to provide the correct addresses.
 *
 * @param domainId The ID of the domain.
 * @param buyerAddress The address of the potential buyer in this conversation.
 * @param sellerAddress The address of the domain owner.
 */
export function useRealtimeChat(domainId: string, buyerAddress: string | null | undefined, sellerAddress: string) {
  const { address: currentUserAddress } = useAccount()
  const [messages, setMessages] = useState<PrismaChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [isBrowser, setIsBrowser] = useState(false)

  // Check if we're in the browser
  useEffect(() => {
    setIsBrowser(typeof window !== 'undefined')
  }, [])

  const initializeConversation = useCallback(async () => {
    if (!buyerAddress || !sellerAddress || !domainId || !isBrowser) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    
    try {
      // Get or create the conversation "room" from our API
      const convResponse = await fetch('/api/chat/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainId, buyerAddress, sellerAddress }),
      })

      if (!convResponse.ok) throw new Error('Failed to establish conversation.')
      const conversation = await convResponse.json()
      if (!conversation?.id) throw new Error('Invalid conversation response.')
      setConversationId(conversation.id)

      // Fetch historical messages for this room
      const historyResponse = await fetch(`/api/chat/history?conversationId=${conversation.id}`)
      if (!historyResponse.ok) throw new Error('Failed to fetch chat history.')
      const historicalMessages: PrismaChatMessage[] = await historyResponse.json()
      setMessages(historicalMessages)

      // Only set up real-time subscription if we're in the browser and have a valid supabase client
      if (typeof window !== 'undefined' && supabase && conversation.id) {
        // Unsubscribe from any existing channel
        if (channel) {
          supabase.removeChannel(channel)
        }

        // Create a new channel with proper configuration
        const newChannel = supabase
          .channel(`chat_room:${conversation.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'chat_messages', // Correct table name from Prisma schema
              filter: `conversationId=eq.${conversation.id}`
            },
            (payload: any) => {
              // Add the new message to the messages array
              setMessages((prev) => [...prev, payload.new as PrismaChatMessage])
            }
          )
          .subscribe((status: any, err: any) => {
            console.log('Real-time channel status:', status)
            if (status === 'SUBSCRIBED') {
              console.log('Successfully subscribed to real-time chat updates')
              setIsLoading(false)
            }
            if (err) {
              console.error('Real-time channel error:', err)
            }
          })
        
        setChannel(newChannel)
      } else {
        setIsLoading(false)
      }

    } catch (error) {
      console.error("Error initializing chat:", error)
      setIsLoading(false)
    }
  }, [buyerAddress, sellerAddress, domainId, isBrowser, channel])

  useEffect(() => {
    if (isBrowser) {
      initializeConversation()
    }
    // Clean up the channel when the component unmounts
    return () => {
      if (channel && typeof window !== 'undefined' && supabase) {
        supabase.removeChannel(channel)
      }
    }
  }, [initializeConversation, isBrowser])

  const sendMessage = async (content: string, messageType: 'text' | 'offer' | 'system' = 'text') => {
    if (!currentUserAddress || !content.trim() || !conversationId || !isBrowser) {
        throw new Error("Cannot send message, chat not fully initialized.")
    }
    const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          conversationId, 
          senderAddress: currentUserAddress, 
          content, 
          messageType 
        }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to send message')
    }
  }

  return { messages, isLoading, sendMessage }
}