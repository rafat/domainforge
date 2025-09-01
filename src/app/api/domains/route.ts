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
  const owner = searchParams.get('owner') // Add owner filter
  const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined
  const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined

  try {
    const skip = (page - 1) * limit

    // Build where condition
    const where: any = {}
    
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      }
    }

    if (forSale) {
      where.forSale = true
    }

    // Filter by owner (wallet address)
    if (owner) {
      where.owner = {
        equals: owner,
        mode: 'insensitive'
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) where.price.gte = minPrice
      if (maxPrice !== undefined) where.price.lte = maxPrice
    }

    // Build orderBy
    const orderBy: any = {}
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
    const { name, owner, registrationPeriod, price } = body

    // Validate required fields
    if (!name || !owner) {
      return NextResponse.json(
        { error: 'Name and owner are required' },
        { status: 400 }
      )
    }

    // Check if domain already exists
    const existingDomain = await prisma.domain.findUnique({
      where: { name }
    })

    if (existingDomain) {
      return NextResponse.json(
        { error: 'Domain already exists' },
        { status: 400 }
      )
    }

    // Calculate expiry date
    const now = new Date()
    const expiryDate = new Date(now.getTime() + (registrationPeriod || 1) * 365 * 24 * 60 * 60 * 1000)

    // Create domain
    const domain = await prisma.domain.create({
      data: {
        name,
        owner,
        contractAddress: '0x0000000000000000000000000000000000000000', // placeholder
        chainId: 1, // default to mainnet
        registrationDate: now,
        expiry: expiryDate,
        price: price ? parseFloat(price) : null,
        forSale: false,
        tokenId: generateTokenId()
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

function generateTokenId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}
