// src/app/api/domains/mint/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, owner, years, amount } = body

    // Validate required fields
    if (!name || !owner || !years || !amount) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if domain is available
    const existingDomain = await prisma.domain.findUnique({
      where: { name: name.toLowerCase() }
    })

    if (existingDomain) {
      return NextResponse.json(
        { error: 'Domain already exists' },
        { status: 400 }
      )
    }

    // Calculate expiry date
    const now = new Date()
    const expiryDate = new Date(now.getTime() + years * 365 * 24 * 60 * 60 * 1000)

    // Generate unique token ID
    const tokenId = generateTokenId()

    // Create domain record
    const domain = await prisma.domain.create({
      data: {
        name: name.toLowerCase(),
        owner: owner.toLowerCase(),
        tokenId,
        contractAddress: '0x1234567890123456789012345678901234567890',
        chainId: 11155111, // Sepolia testnet
        registrationDate: now,
        expiry: expiryDate,
        price: amount,
        forSale: false
      }
    })

    // In a real implementation, you would interact with the smart contract here
    // For now, we'll simulate a transaction hash
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`

    return NextResponse.json({
      domain,
      txHash,
      message: 'Domain minted successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to mint domain:', error)
    return NextResponse.json(
      { error: 'Failed to mint domain' },
      { status: 500 }
    )
  }
}

function generateTokenId(): string {
  return Math.floor(Math.random() * 1000000000).toString()
}