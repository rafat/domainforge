import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function normalizeAddress(address: string): string {
  if (address.startsWith('eip155:97476:')) {
    return address.substring('eip155:97476:'.length);
  }
  return address;
}

export async function POST(request: Request) {
  try {
    const { domainId, buyerAddress, sellerAddress } = await request.json()

    if (!domainId || !buyerAddress || !sellerAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('Request to /api/chat/conversation with body:', { domainId, buyerAddress, sellerAddress });

    const normalizedBuyerAddress = normalizeAddress(buyerAddress).trim().toLowerCase();
    const normalizedSellerAddress = normalizeAddress(sellerAddress).trim().toLowerCase();

    let conversation = await prisma.chatConversation.findUnique({
      where: {
        domainId_buyerAddress_sellerAddress: {
          domainId,
          buyerAddress: normalizedBuyerAddress,
          sellerAddress: normalizedSellerAddress,
        }
      },
    })

    if (!conversation) {
      // if not found, try swapping buyer and seller
      conversation = await prisma.chatConversation.findUnique({
        where: {
          domainId_buyerAddress_sellerAddress: {
            domainId,
            buyerAddress: normalizedSellerAddress,
            sellerAddress: normalizedBuyerAddress,
          }
        },
      })
    }

    if (!conversation) {
      // Only create a new conversation if one was NOT found.
      console.log(`No existing conversation found for domain ${domainId}. Creating a new one.`);
      conversation = await prisma.chatConversation.create({
        data: {
          domainId,
          buyerAddress: normalizedBuyerAddress,
          sellerAddress: normalizedSellerAddress,
          xmtpConversationId: `chat-${domainId}-${Date.now()}`,
        },
      })
    }

    return NextResponse.json(conversation)
  } catch (error) {
    console.error('Error in /api/chat/conversation:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}