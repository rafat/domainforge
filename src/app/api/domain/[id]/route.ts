// src/app/api/domain/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { domaTestnet } from '@/lib/chains';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const domain = await prisma.domain.findUnique({
      where: { id },
      include: {
        offers: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
    }

    return NextResponse.json(domain)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()

    if (body.contractAddress === '0x0000000000000000000000000000000000000000') {
      body.contractAddress = process.env.NEXT_PUBLIC_OWNERSHIP_TOKEN_ADDRESS || '0x424bDf2E8a6F52Bd2c1C81D9437b0DC0309DF90f';
      body.chainId = domaTestnet.id;
    }
    
    const domain = await prisma.domain.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(domain)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
