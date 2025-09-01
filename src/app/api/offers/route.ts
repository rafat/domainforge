// src/app/api/offers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tokenId, buyer, amount, expiry } = body

    // Get domain
    const domain = await prisma.domain.findUnique({
      where: { tokenId }
    })

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      )
    }

    if (domain.owner.toLowerCase() === buyer.toLowerCase()) {
      return NextResponse.json(
        { error: 'Cannot make offer on your own domain' },
        { status: 400 }
      )
    }

    // Check for existing active offer from same buyer
    const existingOffer = await prisma.offer.findFirst({
      where: {
        domainId: domain.id,
        buyer: buyer.toLowerCase(),
        status: 'PENDING'
      }
    })

    if (existingOffer) {
      return NextResponse.json(
        { error: 'You already have an active offer on this domain' },
        { status: 400 }
      )
    }

    // Create offer
    const offer = await prisma.offer.create({
      data: {
        domainId: domain.id,
        buyer: buyer.toLowerCase(),
        amount: parseFloat(amount).toString(),
        expiry: new Date(expiry),
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      offer,
      message: 'Offer submitted successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create offer:', error)
    return NextResponse.json(
      { error: 'Failed to create offer' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const buyer = searchParams.get('buyer')
  const seller = searchParams.get('seller')

  try {
    const where: any = {
      status: 'PENDING',
      expiry: {
        gt: new Date()
      }
    }

    if (buyer) {
      where.buyer = buyer.toLowerCase()
    }

    if (seller) {
      where.domain = {
        owner: seller.toLowerCase()
      }
    }

    const offers = await prisma.offer.findMany({
      where,
      include: {
        domain: true
      },
      orderBy: {
        createdAt: 'desc'
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
