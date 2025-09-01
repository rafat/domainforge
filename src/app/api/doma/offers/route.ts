// src/app/api/doma/offers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { DomaService } from '@/lib/doma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenId = searchParams.get('tokenId')
    
    if (!tokenId) {
      return NextResponse.json({ error: 'Token ID is required' }, { status: 400 })
    }

    const domaService = new DomaService()
    const offers = await domaService.getOrderBookOffers(tokenId)
    
    return NextResponse.json({ offers })
  } catch (error: any) {
    console.error('Error fetching offers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch offers', details: error.message },
      { status: 500 }
    )
  }
}
