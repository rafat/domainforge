import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db' // Assuming your prisma client is exported from here

export async function POST(request: Request) {
  try {
    const { domainId, buyerAddress, sellerAddress } = await request.json()

    if (!domainId || !buyerAddress || !sellerAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Find an existing conversation
    let conversation = await prisma.chatConversation.findFirst({
      where: {
        domainId,
        buyerAddress: buyerAddress.toLowerCase(),
        sellerAddress: sellerAddress.toLowerCase(),
      },
    })

    // If no conversation exists, create one
    if (!conversation) {
      conversation = await prisma.chatConversation.create({
        data: {
          domainId,
          buyerAddress: buyerAddress.toLowerCase(),
          sellerAddress: sellerAddress.toLowerCase(),
          xmtpConversationId: `chat-${domainId}-${Date.now()}`, // Repurposing this field
        },
      })
    }

    return NextResponse.json(conversation)
  } catch (error) {
    console.error('Error in /api/chat/conversation:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}