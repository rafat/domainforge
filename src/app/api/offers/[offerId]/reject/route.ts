// src/app/api/offers/[offerId]/reject/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ offerId: string }> }
) {
  const { offerId } = await params

  try {
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { domain: true }
    })

    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }

    if (offer.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Offer is not active' },
        { status: 400 }
      )
    }

    // Update offer status
    await prisma.offer.update({
      where: { id: offerId },
      data: { status: 'REJECTED' }
    })

    return NextResponse.json({
      message: 'Offer rejected successfully'
    })
  } catch (error) {
    console.error('Failed to reject offer:', error)
    return NextResponse.json(
      { error: 'Failed to reject offer' },
      { status: 500 }
    )
  }
}
