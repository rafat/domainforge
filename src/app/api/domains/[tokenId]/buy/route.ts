// src/app/api/domains/[tokenId]/buy/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const { tokenId } = await params

  try {
    const body = await request.json()
    const { buyer, amount, txHash, orderId } = body

    // Get domain details
    const domain = await prisma.domain.findUnique({
      where: { tokenId },
      include: {
        chatConversations: true
      }
    })

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      )
    }

    if (!domain.forSale) {
      return NextResponse.json(
        { error: 'Domain is not for sale' },
        { status: 400 }
      )
    }

    // Use buyNowPrice if available, otherwise fallback to price
    const expectedPrice = domain.buyNowPrice || domain.price?.toString()
    
    if (!expectedPrice) {
      return NextResponse.json(
        { error: 'No purchase price set for this domain' },
        { status: 400 }
      )
    }

    if (parseFloat(amount) !== parseFloat(expectedPrice)) {
      return NextResponse.json(
        { error: `Incorrect payment amount. Expected ${expectedPrice} ETH` },
        { status: 400 }
      )
    }

    if (domain.owner.toLowerCase() === buyer.toLowerCase()) {
      return NextResponse.json(
        { error: 'Cannot buy your own domain' },
        { status: 400 }
      )
    }



    // Use a transaction to ensure all deletes are successful
    const conversationIds = domain.chatConversations.map(convo => convo.id);
    await prisma.$transaction(async (tx) => {
      // Delete records that have a direct relation to the domain
      await tx.offer.deleteMany({ where: { domainId: domain.id } });
      await tx.transaction.deleteMany({ where: { domainId: domain.id } });
      await tx.dnsRecord.deleteMany({ where: { domainId: domain.id } });

      // Delete chat messages related to the conversations of this domain
      if (conversationIds.length > 0) {
        await tx.chatMessage.deleteMany({ where: { conversationId: { in: conversationIds } } });
      }

      // Delete the chat conversations themselves
      await tx.chatConversation.deleteMany({ where: { domainId: domain.id } });

      // Finally, delete the domain
      await tx.domain.delete({ where: { id: domain.id } });
    });

    return NextResponse.json({
      message: 'Domain purchased successfully and removed from database'
    })
  } catch (error) {
    console.error('Failed to purchase domain:', error)
    return NextResponse.json(
      { error: 'Failed to purchase domain' },
      { status: 500 }
    )
  }
}