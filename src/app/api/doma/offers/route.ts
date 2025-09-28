// src/app/api/doma/offers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { domaServerService } from '@/lib/doma.server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenId = searchParams.get('tokenId')
    
    if (!tokenId) {
      return NextResponse.json({ error: 'Token ID is required' }, { status: 400 })
    }

    const offers = await domaServerService.getOrderBookOffers(tokenId)
    
    return NextResponse.json({ offers })
  } catch (error: any) {
    console.error('Error fetching offers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch offers', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenId, amount, buyerAddress } = body;

    if (!tokenId || !amount || !buyerAddress) {
      return NextResponse.json(
        { error: 'Token ID, amount, and buyer address are required' },
        { status: 400 }
      );
    }

    // Convert amount to the proper format for Doma (likely wei)
    // Assuming 'amount' is in ETH format (like '0.1') and needs to be converted to wei
    // The domaServerService.createOffer will handle the conversion internally

    const offerResponse = await domaServerService.createOffer(tokenId, amount, buyerAddress);
    
    return NextResponse.json({ 
      success: true,
      data: offerResponse,
      message: 'Offer created successfully'
    });
  } catch (error: any) {
    console.error('Error creating offer:', error);
    return NextResponse.json(
      { error: 'Failed to create offer', details: error.message },
      { status: 500 }
    )
  }
}
