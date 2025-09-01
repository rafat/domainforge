// src/app/api/offers/[offerId]/accept/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ offerId: string }> }
) {
  const { offerId } = await params

  try {
    const body = await request.json()
    const { seller } = body

    // Get offer with domain details
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

    if (offer.expiry && new Date() > offer.expiry) {
      return NextResponse.json(
        { error: 'Offer has expired' },
        { status: 400 }
      )
    }

    if (offer.domain.owner.toLowerCase() !== seller.toLowerCase()) {
      return NextResponse.json(
        { error: 'Only domain owner can accept offers' },
        { status: 403 }
      )
    }

    // Execute the sale
    await prisma.$transaction(async (tx) => {
      // Update offer status
      await tx.offer.update({
        where: { id: offerId },
        data: { status: 'ACCEPTED' }
      })

      // Transfer domain ownership
      await tx.domain.update({
        where: { id: offer.domainId },
        data: {
          owner: offer.buyer,
          forSale: false,
          price: null
        }
      })

      // Create transaction record
      await tx.transaction.create({
        data: {
          domainId: offer.domainId,
          buyer: offer.buyer,
          seller: offer.domain.owner,
          amount: offer.amount,
          txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          status: 'PENDING'
        }
      })

      // Cancel other active offers for this domain
      await tx.offer.updateMany({
        where: {
          domainId: offer.domainId,
          status: 'ACCEPTED',
          id: { not: offerId }
        },
        data: { status: 'REJECTED' }
      })
    })

    return NextResponse.json({
      message: 'Offer accepted successfully'
    })
  } catch (error) {
    console.error('Failed to accept offer:', error)
    return NextResponse.json(
      { error: 'Failed to accept offer' },
      { status: 500 }
    )
  }
}
