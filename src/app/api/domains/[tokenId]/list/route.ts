// src/app/api/domains/[tokenId]/list/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const { tokenId } = await params

  try {
    const body = await request.json()
    const { price, seller } = body

    // Verify domain exists and belongs to seller
    const domain = await prisma.domain.findUnique({
      where: { tokenId }
    })

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      )
    }

    if (domain.owner.toLowerCase() !== seller.toLowerCase()) {
      return NextResponse.json(
        { error: 'Only domain owner can list for sale' },
        { status: 403 }
      )
    }

    // Update domain listing
    const updatedDomain = await prisma.domain.update({
      where: { tokenId },
      data: {
        price: parseFloat(price),
        buyNowPrice: price.toString(), // Store the exact price input as buyNowPrice
        forSale: true
      }
    })

    return NextResponse.json({
      domain: updatedDomain,
      message: 'Domain listed successfully'
    })
  } catch (error) {
    console.error('Failed to list domain:', error)
    return NextResponse.json(
      { error: 'Failed to list domain' },
      { status: 500 }
    )
  }
}
