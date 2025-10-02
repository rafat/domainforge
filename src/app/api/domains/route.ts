import { domaTestnet } from '@/lib/chains';
// src/app/api/domains/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'
  const forSale = searchParams.get('forSale') === 'true'
  const hasBuyNowPrice = searchParams.get('hasBuyNowPrice') === 'true'
  const isActive = searchParams.get('isActive') === 'true'
  const owner = searchParams.get('owner') // Add owner filter
  const name = searchParams.get('name') // Add name filter
  const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined
  const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined

  try {
    const skip = (page - 1) * limit

    // Build where condition
    
    const where: {
      name?: {
        contains: string;
        mode: 'insensitive';
      } | string;
      forSale?: boolean;
      owner?: {
        equals: string;
        mode: 'insensitive';
      };
      price?: {
        gte?: number;
        lte?: number;
      };
      buyNowPrice?: {
        not: null;
      };
      isActive?: boolean;
    } = {};

    
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      }
    }

    // Exact name match filter
    if (name) {
      where.name = name
    }

    if (forSale) {
      where.forSale = true
    }

    if (hasBuyNowPrice) {
      where.buyNowPrice = {
        not: null,
      }
    }

    if (isActive) {
      where.isActive = true
    }

    // Filter by owner (wallet address)
    if (owner) {
      where.owner = {
        equals: owner,
        mode: 'insensitive'
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      };
    }

    // Build orderBy
    const orderBy: Record<string, unknown> = {}
    orderBy[sortBy] = sortOrder

    const [domains, total] = await Promise.all([
      prisma.domain.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          offers: true
        }
      }),
      prisma.domain.count({ where })
    ])

    return NextResponse.json({
      domains,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Failed to fetch domains:', error)
    return NextResponse.json(
      { error: 'Failed to fetch domains' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      owner, 
      registrationPeriod, 
      price, 
      forSale, 
      tokenId,
      title,
      description,
      template,
      customCSS,
      buyNowPrice,
      acceptOffers,
      isActive,
      metaTitle,
      metaDescription
    } = body

    // Validate required fields
    if (!name || !owner || !tokenId) {
      return NextResponse.json(
        { error: 'Name, owner, and tokenId are required' },
        { status: 400 }
      )
    }

    // Check if domain already exists
    const existingDomain = await prisma.domain.findUnique({
      where: { name }
    })

    if (existingDomain) {
      // If it's the same owner, allow updating the existing domain
      if (existingDomain.owner.toLowerCase() === owner.toLowerCase()) {
        const updatedDomain = await prisma.domain.update({
          where: { id: existingDomain.id },
          data: {
            ...body,
            expiry: body.expiry ? new Date(body.expiry) : undefined,
            price: body.price !== undefined ? parseFloat(String(body.price)) : null,
            buyNowPrice: body.buyNowPrice !== undefined ? String(body.buyNowPrice) : null,
            forSale: body.forSale !== undefined ? Boolean(body.forSale) : existingDomain.forSale,
            acceptOffers: body.acceptOffers !== undefined ? Boolean(body.acceptOffers) : existingDomain.acceptOffers,
            isActive: body.isActive !== undefined ? Boolean(body.isActive) : existingDomain.isActive,
            updatedAt: new Date()
          }
        })
        return NextResponse.json({ domain: updatedDomain }, { status: 200 })
      } else {
        return NextResponse.json(
          { error: 'Domain already exists and is owned by another user' },
          { status: 400 }
        )
      }
    }

    // Calculate expiry date
    const now = new Date()
    const expiryDate = new Date(now.getTime() + (registrationPeriod || 1) * 365 * 24 * 60 * 60 * 1000)

    // Create domain
    const domain = await prisma.domain.create({
      data: {
        name,
        owner,
        contractAddress: process.env.NEXT_PUBLIC_OWNERSHIP_TOKEN_ADDRESS || '0x424bDf2E8a6F52Bd2c1C81D9437b0DC0309DF90f',
        chainId: domaTestnet.id, // default to mainnet
        registrationDate: now,
        expiry: expiryDate,
        price: price ? parseFloat(String(price)) : null,
        forSale: forSale || false,
        title: title || null,
        description: description || null,
        template: template || 'minimal',
        customCSS: customCSS || null,
        buyNowPrice: buyNowPrice !== undefined ? String(buyNowPrice) : null,
        acceptOffers: acceptOffers !== undefined ? Boolean(acceptOffers) : true,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        tokenId: tokenId
      }
    })

    return NextResponse.json({ domain }, { status: 201 })
  } catch (error) {
    console.error('Failed to create domain:', error)
    return NextResponse.json(
      { error: 'Failed to create domain' },
      { status: 500 }
    )
  }
}