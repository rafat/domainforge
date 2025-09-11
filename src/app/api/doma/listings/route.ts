// src/app/api/doma/listings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { domaServerService } from '@/lib/doma.server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenId = searchParams.get('tokenId')
    
    if (!tokenId) {
      return NextResponse.json({ error: 'Token ID is required' }, { status: 400 })
    }

    const listings = await domaServerService.getOrderBookListings(tokenId)
    
    return NextResponse.json({ listings })
  } catch (error: any) {
    console.error('Error fetching listings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listings', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { parameters, signature } = body

    if (!parameters || !signature) {
      return NextResponse.json(
        { error: 'Order parameters and signature are required' },
        { status: 400 }
      )
    }

    // With the Doma Orderbook SDK, listing creation is now handled client-side
    // This endpoint is kept for backward compatibility but will return a deprecation message
    console.warn('Deprecated: Server-side listing creation is no longer recommended. Use the Doma Orderbook SDK client-side instead.');
    
    const newListing = await domaServerService.createListing(parameters, signature)
    
    return NextResponse.json({
      listing: newListing,
      message: 'Domain listed successfully (server-side, deprecated approach)'
    })
  } catch (error: any) {
    console.error('Error creating listing:', error)
    return NextResponse.json(
      { error: 'Failed to create listing', details: error.message },
      { status: 500 }
    )
  }
}