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
    const { buyer, amount } = body

    // Get domain details
    const domain = await prisma.domain.findUnique({
      where: { tokenId }
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

    // Transfer domain ownership
    const updatedDomain = await prisma.domain.update({
      where: { tokenId },
      data: {
        owner: buyer.toLowerCase(),
        forSale: false,
        price: null,
        buyNowPrice: null
      }
    })

    // Create transaction record
    await prisma.transaction.create({
      data: {
        domainId: domain.id,
        buyer: buyer.toLowerCase(),
        seller: domain.owner,
        amount: amount,
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      domain: updatedDomain,
      message: 'Domain purchased successfully'
    })
  } catch (error) {
    console.error('Failed to purchase domain:', error)
    return NextResponse.json(
      { error: 'Failed to purchase domain' },
      { status: 500 }
    )
  }
}