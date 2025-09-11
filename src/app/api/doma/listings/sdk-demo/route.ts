// src/app/api/doma/listings/sdk-demo/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { domaServerService } from '@/lib/doma.server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contractAddress, tokenId, price, sellerAddress } = body

    if (!contractAddress || !tokenId || !price || !sellerAddress) {
      return NextResponse.json(
        { error: 'Contract address, token ID, price, and seller address are required' },
        { status: 400 }
      )
    }

    // This is a demo endpoint showing how the SDK could be used server-side
    // In practice, listing creation should be done client-side with a wallet signer
    console.log('Demo: Creating listing with Doma SDK server-side approach');
    
    // Note: Actual implementation would require a server-side signer which is not recommended
    // for security reasons. This is just for demonstration purposes.
    const result = await domaServerService.createListingWithSdk({
      contractAddress,
      tokenId,
      price,
      sellerAddress
    });
    
    return NextResponse.json({
      result,
      message: 'This is a demo endpoint. In practice, use the Doma Orderbook SDK client-side.'
    })
  } catch (error: any) {
    console.error('Error in SDK demo:', error)
    return NextResponse.json(
      { error: 'Failed to process SDK demo', details: error.message },
      { status: 500 }
    )
  }
}