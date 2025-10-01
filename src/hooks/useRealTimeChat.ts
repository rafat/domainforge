'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  const isInitializing = useRef(false);

  // Check if we're in the browser
  useEffect(() => {
    setIsBrowser(typeof window !== 'undefined')
  }, [])

  useEffect(() => {
    // This effect is responsible for fetching the conversation ID and historical messages.
    const initializeAndFetchHistory = async () => {
      if (!buyerAddress || !sellerAddress || !domainId || isInitializing.current) {
        setMessages([]);
        setConversationId(null);
        setIsLoading(false);
        return;
      }

      isInitializing.current = true;
      setIsLoading(true);
      setMessages([]); // Clear old messages immediately
      try {
        const convResponse = await fetch('/api/chat/conversation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domainId, buyerAddress, sellerAddress }),
        });
        if (!convResponse.ok) throw new Error('Failed to establish conversation.');
        
        const conversation = await convResponse.json();
        if (!conversation?.id) throw new Error('Invalid conversation response.');
        
        setConversationId(conversation.id);

        const historyResponse = await fetch(`/api/chat/history?conversationId=${conversation.id}`);
        if (!historyResponse.ok) throw new Error('Failed to fetch chat history.');
        
        const historicalMessages: PrismaChatMessage[] = await historyResponse.json();
        setMessages(historicalMessages);
      } catch (error) {
        console.error("Error initializing conversation:", error);
        setMessages([]);
      } finally {
        setIsLoading(false);
        isInitializing.current = false;
      }
    };

    initializeAndFetchHistory();
  }, [domainId, buyerAddress, sellerAddress]);

  useEffect(() => {
    // This effect is solely responsible for the real-time subscription.
    // It activates when we have a conversationId and cleans up properly.
    if (!conversationId || !isBrowser || !supabase) {
      return;
    }

    const newChannel = supabase
      .channel(`chat_room:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversationId=eq.${conversationId}`
        },
        (payload: any) => {
          setMessages((prev) => [...prev, payload.new as PrismaChatMessage]);
        }
      )
      .subscribe((status: any, err: any) => {
        console.log(`Real-time channel (conv: ${conversationId}) status:`, status);
        if (err) {
          console.error(`Real-time channel (conv: ${conversationId}) error:`, err);
        }
      });

    setChannel(newChannel);

    // Cleanup function to remove the channel subscription
    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel);
        setChannel(null);
      }
    };
  }, [conversationId, isBrowser]);

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

  return { messages, isLoading, sendMessage, conversationId }
}