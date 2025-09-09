// src/app/api/doma/listings/[listingId]/fulfillment/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { domaServerService } from '@/lib/doma.server'

export async function GET(request: NextRequest, { params }: { params: { listingId: string } }) {
  try {
    const { listingId } = params;
    const { searchParams } = new URL(request.url)
    const buyerAddress = searchParams.get('buyerAddress')

    if (!buyerAddress) {
      return NextResponse.json({ error: 'Buyer address is required' }, { status: 400 })
    }

    const fulfillmentData = await domaServerService.getListingFulfillmentData(listingId, buyerAddress)
    
    return NextResponse.json(fulfillmentData)
  } catch (error: any) {
    console.error('Error getting listing fulfillment data:', error)
    return NextResponse.json(
      { error: 'Failed to get listing fulfillment data', details: error.message },
      { status: 500 }
    )
  }
}
