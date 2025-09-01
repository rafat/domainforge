// src/app/api/landing/[tokenId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const { tokenId } = await params
  
  try {
    const domain = await prisma.domain.findUnique({
      where: { tokenId },
      select: { 
        isActive: true,
        title: true,
        description: true,
        template: true,
        price: true,
        forSale: true
      }
    })

    if (!domain) {
      return NextResponse.json({ exists: false }, { status: 404 })
    }

    return NextResponse.json({ 
      exists: domain.isActive,
      domain 
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}