import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { conversationId, senderAddress, content, messageType = 'text' } = await request.json()

    if (!conversationId || !senderAddress || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newMessage = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderAddress: senderAddress.toLowerCase(),
        content,
        messageType,
      },
    })

    // Trigger a broadcast here

    return NextResponse.json(newMessage)
  } catch (error) {
    console.error('Error in /api/chat/message:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}