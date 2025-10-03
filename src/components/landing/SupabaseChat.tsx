'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useRealtimeChat } from '@/hooks/useRealTimeChat'
import { ChatMessage as PrismaChatMessage, ChatConversation } from '@prisma/client'
import { formatAddress } from '@/lib/utils'
import { supabase } from '@/lib/supabase';
import { useWalletClient } from 'wagmi';
import { createDomaOffer, getDomaSupportedCurrencies } from '@/lib/domaOrderbookSdk';
import { useDomainData } from '@/hooks/useDomainData';
import { RealtimePostgresChangesPayload, REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';
import { DomaOffer } from '@/types/doma';

import { useBalance } from 'wagmi';

const WETH_CONTRACT_ADDRESS = '0x6f898cd313dcEe4D28A87F675BD93C471868B0Ac';

interface SupabaseChatProps {
  domainId: string // This should be the Prisma `id`, not `tokenId`
  ownerAddress: string
  domainName: string
  tokenId: string
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
  isOwner,
  conversationId,
  tokenId
}: {
  messages: PrismaChatMessage[],
  isLoading: boolean,
  onSendMessage: (content: string, type: 'text' | 'offer' | 'system') => Promise<void>,
  currentUserAddress: string,
  isOwner: boolean,
  conversationId: string | null,
  tokenId: string
}) {
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showOfferForm, setShowOfferForm] = useState(false)
  const [offerAmount, setOfferAmount] = useState('')
  const [offerMessage, setOfferMessage] = useState('')
  const { data: walletClient } = useWalletClient();
  const { domain: domainData } = useDomainData(tokenId);

  const { data: wethBalance } = useBalance({
    address: currentUserAddress as `0x${string}` | undefined,
    token: WETH_CONTRACT_ADDRESS as `0x${string}`,
  });

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return
    setIsSending(true)
    await onSendMessage(newMessage, 'text')
    setNewMessage('')
    setIsSending(false)
  }

  const handleSendOffer = async () => {
    if (!offerAmount || parseFloat(offerAmount) <= 0 || !walletClient || !domainData) {
      alert('Please fill in all fields and ensure your wallet is connected.');
      return;
    }

    setIsSending(true);
    try {
      // Get supported currencies for the domain using the helper function
      const currencies = await getDomaSupportedCurrencies('eip155:97476', domainData.contractAddress);
      const currency = currencies?.[0];

      // 1. Create the on-chain offer using the Doma SDK
      const offerResult = await createDomaOffer({
        contractAddress: domainData.contractAddress,
        tokenId: domainData.tokenId,
        price: offerAmount,
        buyerAddress: currentUserAddress,
      }, walletClient, 'eip155:97476', undefined);

      if (!offerResult?.orders?.[0]?.orderId) {
        throw new Error('Failed to create on-chain offer or receive order ID.');
      }

      const orderId = offerResult.orders[0].orderId;

      // 2. Send the created orderId to our backend to log it
      const response = await fetch('/api/chat/create-offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          senderAddress: currentUserAddress,
          amount: parseFloat(offerAmount),
          message: offerMessage,
          orderId: orderId, // Pass the on-chain order ID
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to log offer in database');
      }

      // The backend will have created the chat message via a trigger or explicitly
      console.log('On-chain offer created and logged successfully:', await response.json());
      
      // Reset offer form
      setOfferAmount('');
      setOfferMessage('');
      setShowOfferForm(false);
    } catch (error) {
      console.error('Failed to send offer:', error);
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Try to get message from any object, or stringify the whole object
        errorMessage = (error as any).message || JSON.stringify(error);
      }
      alert(`Failed to make offer: ${errorMessage}`);
    } finally {
      setIsSending(false);
    }
  }

  const handleAcceptOffer = async (messageId: string) => {
    if (!isOwner || !walletClient) {
      alert('Only the domain owner can accept offers and wallet must be connected.');
      return;
    }

    try {
      const message = messages.find(msg => msg.id === messageId);
      if (!message) throw new Error('Message not found');

      const offerAmountMatch = message.content.match(/💰 New offer: ([\d.]+) WETH/);
      if (!offerAmountMatch) throw new Error('Could not extract offer amount from message');
      const offerAmount = offerAmountMatch[1];

      const offers = await fetch(`/api/domains/${tokenId}/offers`).then(res => res.json()).then(data => data.offers || []);
      console.log("offers", offers);
      const offer = offers.find((o: DomaOffer) => 
        o.amount && parseFloat(o.amount) === parseFloat(offerAmount) && 
        o.buyer && message.senderAddress && o.buyer.toLowerCase() === message.senderAddress.toLowerCase() && 
        o.status === 'PENDING'
      );
      
      console.log("offer", offer);

      if (!offer) throw new Error('Corresponding offer not found in database');

      const orderId = offer.txHash; // Get orderId from txHash
      if (!orderId) throw new Error('Offer is missing the on-chain order ID (txHash).');

      const { acceptDomaOffer } = await import('@/lib/domaOrderbookSdk');
      const result = await acceptDomaOffer(orderId, walletClient);

      if (result) {
        alert('Offer accepted successfully! The domain has been transferred.');
        await onSendMessage(`🎉 Offer for ${offerAmount} WETH accepted!`, 'system');

        // Now, clean up the database
        const deleteResponse = await fetch(`/api/domains/${tokenId}`, {
          method: 'DELETE',
        });

        if (deleteResponse.ok) {
          console.log('Domain and related records removed from database successfully.');
          // Optionally, you could add logic here to refresh the UI or redirect the user
        } else {
          const errorData = await deleteResponse.json();
          console.error('Failed to remove domain from database after accepting offer:', errorData);
          alert('Blockchain transaction was successful, but failed to clean up the database.');
        }
      } else {
        throw new Error('Failed to accept offer on blockchain.');
      }
    } catch (error) {
      console.error('Failed to accept offer:', error);
      alert(`Failed to accept offer: ${error instanceof Error ? error.message : 'Unknown error'}`);
      await onSendMessage(`❌ Failed to accept offer: ${error instanceof Error ? error.message : 'Unknown error'}`, 'system');
    }
  }

  const handleRejectOffer = async (messageId: string) => {
    if (!isOwner) return
    
    try {
      // Extract offer amount from the message content
      const message = messages.find(msg => msg.id === messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      const match = message.content.match(/💰 New offer: ([\d.]+) ETH/);
      if (!match) {
        throw new Error('Could not extract offer amount from message');
      }

      const offerAmount = match[1];
      
      // Find the corresponding offer in the database using tokenId
      const offers = await fetch(`/api/domains/${tokenId}/offers`)
        .then(res => res.json())
        .then(data => data.offers || []);

      // Find the most recent pending offer with the matching amount from the same buyer
      const offer = offers.find((o: DomaOffer) => 
        o.amount && parseFloat(o.amount) === parseFloat(offerAmount) && 
        o.buyer === message.senderAddress && 
        o.status === 'PENDING'
      );

      if (!offer) {
        throw new Error('Corresponding offer not found in database');
      }

      // Send a system message indicating the offer is being rejected
      const rejectMessage = `❌ Offer rejected by owner. Offer for ${offerAmount} ETH has been declined.`
      await onSendMessage(rejectMessage, 'system');
      
      // Call the API to reject the offer
      const response = await fetch(`/api/offers/${offer.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject',
          sellerAddress: currentUserAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject offer');
      }

      await response.json();

      // Notify that rejection was successful
      await onSendMessage(`✅ Offer rejection processed successfully.`, 'system');
    } catch (error) {
      console.error('Failed to reject offer:', error)
      const errorMessage = `❌ Failed to reject offer: ${error instanceof Error ? error.message : 'Unknown error'}`;
      await onSendMessage(errorMessage, 'system');
    }
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
            const isOfferMessage = msg.messageType === 'offer'
            const isSystemMessage = msg.messageType === 'system'
            
            // Check if this is an offer message and extract offer details
            let offerAmount = ''
            if (isOfferMessage) {
              const match = msg.content.match(/💰 New offer: ([\d.]+) ETH/)
              if (match) {
                offerAmount = match[1]
              }
            }
            
            return (
              <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwnMessage ? 'bg-blue-600 text-white' : 
                  isOfferMessage ? 'bg-green-100 border border-green-300 text-gray-800' : 
                  isSystemMessage ? 'bg-blue-100 border border-blue-300 text-gray-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {isOfferMessage ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600"></span>
                        <span className={isOwnMessage ? 'text-white' : 'text-green-700 font-medium'}>
                          {msg.content}
                        </span>
                      </div>
                      {msg.content.includes('\n') && (
                        <p className={isOwnMessage ? 'text-white' : 'text-gray-700'}>
                          {msg.content.split('\n')[1]}
                        </p>
                      )}
                      {!isOwnMessage && isOwner && (
                        <div className="flex space-x-2 pt-2">
                          <button
                            onClick={() => handleAcceptOffer(msg.id)}
                            className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
                          >
                            Accept
                          </button>
                        </div>
                      )}
                      <p className={`text-xs ${isOwnMessage ? 'text-blue-200' : 'text-gray-500'}`}>
                        {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className={`text-sm ${isSystemMessage ? 'text-gray-800' : isOwnMessage ? 'text-white' : 'text-gray-800'}`}>
                        {msg.content}
                      </p>
                      <p className={`text-xs mt-1 text-right ${isOwnMessage ? 'text-blue-200' : 'text-gray-500'}`}>
                        {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
      
      {/* Offer Form Modal */}
      {showOfferForm && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Make an Offer</h3>
              <button 
                onClick={() => setShowOfferForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Offer Amount (WETH)
                </label>
                {wethBalance && (
                  <p className="text-xs text-gray-500 mb-1">
                    Your balance: {wethBalance.formatted} {wethBalance.symbol}
                  </p>
                )}
                <input
                  type="number"
                  step="0.001"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  placeholder="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (optional)
                </label>
                <textarea
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  placeholder="Add a note with your offer..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none text-gray-900 bg-white"
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowOfferForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendOffer}
                  disabled={!offerAmount || parseFloat(offerAmount) <= 0 || isSending}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isSending ? 'Sending...' : 'Send Offer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="border-t p-4 space-y-3">
        {!isOwner && (
          <button
            onClick={() => setShowOfferForm(true)}
            className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
          >
            <span>💰</span>
            <span>Make an Offer</span>
          </button>
        )}
        
        <div className="flex items-center space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow resize-none border rounded-lg px-3 py-2 text-sm text-gray-900 bg-white"
            disabled={isSending}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className="flex-shrink-0 bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}


function normalizeAddress(address: string): string {
  const prefix = 'eip155:97476:';
  if (address.toLowerCase().startsWith(prefix)) {
    return address.substring(prefix.length);
  }
  return address;
}

export function SupabaseChat({ domainId, ownerAddress, domainName, tokenId }: SupabaseChatProps) {
  const { address: currentUserAddress, isConnected } = useAccount()
  const isOwner = isConnected && currentUserAddress && normalizeAddress(currentUserAddress).toLowerCase() === normalizeAddress(ownerAddress).toLowerCase()

  // State for the Owner's Inbox View
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [selectedConvo, setSelectedConvo] = useState<ConversationWithDetails | null>(null)
  const [isInboxLoading, setIsInboxLoading] = useState(true)

  // Fetch and subscribe to conversations if the current user is the owner
  useEffect(() => {
    if (!isOwner || !domainId) return;

    const fetchConversations = async () => {
      setIsInboxLoading(true);
      try {
        const res = await fetch(`/api/chat/conversations-for-domain?domainId=${domainId}`);
        if (!res.ok) throw new Error('Failed to fetch conversations');
        const data: ConversationWithDetails[] = await res.json();
        setConversations(data);
      } catch (error) {
        console.error("Failed to fetch owner conversations", error);
      } finally {
        setIsInboxLoading(false);
      }
    };

    // Fetch initial data
    fetchConversations();

    // Set up real-time subscription
    const channel = supabase
      .channel(`conversations_for_domain:${domainId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT and UPDATE
          schema: 'public',
          table: 'chat_conversations',
          filter: `domainId=eq.${domainId}`
        },
        (payload: RealtimePostgresChangesPayload<ChatConversation>) => {
          console.log('Change detected in conversations, refetching...', payload);
          // Re-fetch the entire list to get updated order and message previews
          fetchConversations();
        }
      )
      .subscribe((status: `${REALTIME_SUBSCRIBE_STATES}`, err?: Error) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to conversation updates for domain ${domainId}`);
        }
        if (err) {
          console.error('Subscription error:', err);
        }
      });

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOwner, domainId]);

  // --- BUYER'S VIEW LOGIC ---
  // The buyer only needs to manage one conversation: their own.
  function BuyerView() {
    const { messages, isLoading, sendMessage, conversationId } = useRealtimeChat(domainId, currentUserAddress, ownerAddress)
    return (
      <ChatInterface 
        messages={messages} 
        isLoading={isLoading} 
        onSendMessage={sendMessage} 
        currentUserAddress={currentUserAddress!}
        isOwner={false}
        conversationId={conversationId}
        tokenId={tokenId}
      />
    )
  }

  // --- OWNER'S VIEW LOGIC ---

  // This component is instantiated when a conversation is selected.
  // Its lifecycle is tied to the selection, ensuring the useRealtimeChat hook
  // is mounted and unmounted cleanly.
  function SelectedConversationChat({ conversation, ownerAddress, domainId, tokenId, currentUserAddress }: {
    conversation: ConversationWithDetails;
    ownerAddress: string;
    domainId: string;
    tokenId: string;
    currentUserAddress: string;
  }) {
    const { messages, isLoading, sendMessage } = useRealtimeChat(domainId, conversation.buyerAddress, ownerAddress);

    return (
      <ChatInterface
        messages={messages}
        isLoading={isLoading}
        onSendMessage={sendMessage}
        currentUserAddress={currentUserAddress}
        isOwner={true}
        conversationId={conversation.id}
        tokenId={tokenId}
      />
    );
  }

  // The owner sees a list of conversations and can select one to chat in.
  function OwnerView() {
    // The useRealtimeChat hook is no longer here.
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
                <p className="font-semibold text-sm text-gray-800">From: {formatAddress(convo.buyerAddress)}</p>
                <p className="text-xs text-gray-600 truncate">{convo.messages[0]?.content || '...'}</p>
              </div>
            ))
          )}
        </div>
        <div className="w-2/3">
          {selectedConvo ? (
            <SelectedConversationChat
              conversation={selectedConvo}
              ownerAddress={ownerAddress}
              domainId={domainId}
              tokenId={tokenId}
              currentUserAddress={currentUserAddress!}
            />
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
