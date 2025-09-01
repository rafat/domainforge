// src/app/api/domains/[tokenId]/offers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const { tokenId } = await params

  try {
    const domain = await prisma.domain.findUnique({
      where: { tokenId }
    })

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      )
    }

    const offers = await prisma.offer.findMany({
      where: {
        domainId: domain.id,
        status: 'PENDING',
        expiry: {
          gt: new Date()
        }
      },
      orderBy: {
        amount: 'desc'
      }
    })

    return NextResponse.json({ offers })
  } catch (error) {
    console.error('Failed to fetch offers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    )
  }
}
