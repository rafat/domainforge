// src/app/api/doma/listings/[listingId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { domaServerService } from '@/lib/doma.server'

export async function PUT(request: NextRequest, { params }: { params: { listingId: string } }) {
  try {
    const { listingId } = params;
    const body = await request.json()
    const { tokenId, newPrice, walletAddress } = body

    if (!tokenId || !newPrice || !walletAddress) {
      return NextResponse.json(
        { error: 'Token ID, new price, and wallet address are required' },
        { status: 400 }
      )
    }

    const updatedListing = await domaServerService.updateListing(listingId, tokenId, newPrice, walletAddress)
    
    return NextResponse.json({
      listing: updatedListing,
      message: 'Listing updated successfully'
    })
  } catch (error: any) {
    console.error('Error updating listing:', error)
    return NextResponse.json(
      { error: 'Failed to update listing', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { listingId: string } }) {
  try {
    const { listingId } = params;
    const body = await request.json()
    const { walletAddress } = body

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    await domaServerService.cancelListing(listingId, walletAddress)
    
    return NextResponse.json({ message: 'Listing canceled successfully' })
  } catch (error: any) {
    console.error('Error canceling listing:', error)
    return NextResponse.json(
      { error: 'Failed to cancel listing', details: error.message },
      { status: 500 }
    )
  }
}
