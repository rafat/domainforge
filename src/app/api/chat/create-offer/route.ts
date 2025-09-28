import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    // The Doma SDK has already created the on-chain offer.
    // This endpoint now just logs it to our local DB and creates the chat message.
    const { conversationId, senderAddress, amount, message, orderId } = await request.json();

    if (!conversationId || !senderAddress || !amount || !orderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
      include: { domain: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const { domain } = conversation;

    // Create the offer in our local database, linking it to the on-chain order
    const offer = await prisma.offer.create({
      data: {
        domainId: domain.id,
        buyer: senderAddress.toLowerCase(),
        amount: amount.toString(),
        message: message,
        status: 'PENDING',
        orderId: orderId, // Save the on-chain order ID
        expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });

    // Create a chat message to reflect the new on-chain offer
    const offerMessageContent = `💰 New offer: ${amount} ETH` + (message ? `\n${message}` : '');
    const chatMessage = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderAddress: senderAddress.toLowerCase(),
        content: offerMessageContent,
        messageType: 'offer',
      },
    });

    return NextResponse.json({ 
      offer, 
      message: 'Offer created successfully',
      chatMessage: offerMessage 
    })
  } catch (error) {
    console.error('Failed to create offer from chat:', error)
    return NextResponse.json(
      { error: 'Failed to create offer' }, 
      { status: 500 }
    )
  }
}