import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const conversationId = searchParams.get('conversationId')

  if (!conversationId) {
    return NextResponse.json({ error: 'conversationId is required' }, { status: 400 })
  }

  try {
    const messages = await prisma.chatMessage.findMany({
      where: {
        conversationId: conversationId,
      },
      orderBy: {
        sentAt: 'asc', // Order messages chronologically
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching chat history:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}