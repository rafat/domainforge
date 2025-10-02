import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const revalidate = 0; // Ensure this route is always dynamic

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const domainId = searchParams.get('domainId')

  console.log('Request to /api/chat/conversations-for-domain with domainId:', domainId);

  if (!domainId) {
    return NextResponse.json({ error: 'domainId is required' }, { status: 400 })
  }

  try {
    const conversations = await prisma.chatConversation.findMany({
      where: {
        domainId: domainId,
      },
      include: {
        // Include the latest message for a preview in the inbox list
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json(conversations)
  } catch (error) {
    console.error('Error fetching domain conversations:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}