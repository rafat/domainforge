import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { domainId, buyerAddress, sellerAddress } = await request.json()

    if (!domainId || !buyerAddress || !sellerAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const lowerBuyerAddress = buyerAddress.toLowerCase()
    const lowerSellerAddress = sellerAddress.toLowerCase()

    // --- ROBUSTNESS FIX ---
    // Find a conversation where the participants match in either role.
    // This prevents creating duplicate conversations if a user is both a buyer and seller in different contexts.
    let conversation = await prisma.chatConversation.findFirst({
      where: {
        domainId,
        // The AND/OR logic ensures we find the conversation regardless of who initiated it.
        OR: [
          {
            buyerAddress: lowerBuyerAddress,
            sellerAddress: lowerSellerAddress,
          },
          {
            buyerAddress: lowerSellerAddress,
            sellerAddress: lowerBuyerAddress,
          },
        ],
      },
    })

    if (!conversation) {
      // Only create a new conversation if one was NOT found.
      console.log(`No existing conversation found for domain ${domainId}. Creating a new one.`);
      conversation = await prisma.chatConversation.create({
        data: {
          domainId,
          buyerAddress: lowerBuyerAddress,
          sellerAddress: lowerSellerAddress,
          xmtpConversationId: `chat-${domainId}-${Date.now()}`,
        },
      })
    } else {
      console.log(`Found existing conversation: ${conversation.id}`);
    }

    return NextResponse.json(conversation)
  } catch (error) {
    console.error('Error in /api/chat/conversation:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}