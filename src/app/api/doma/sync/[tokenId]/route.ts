// src/app/api/doma/sync/[tokenId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { domaServerService } from '@/lib/doma.server'
import { parseEther, formatEther } from 'viem'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const { tokenId } = await params
  
  try {
    if (!tokenId) {
      return NextResponse.json(
        { error: 'Token ID is required' },
        { status: 400 }
      )
    }

    // Get the domain from our database
    const domain = await prisma.domain.findUnique({
      where: { tokenId }
    })

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain not found in database' },
        { status: 404 }
      )
    }

    // Fetch fresh data from Doma Protocol
    const domaDomainInfo = await domaServerService.getDomainInfo(tokenId, false)
    
    // Fetch current listings and offers
    const [listings, offers] = await Promise.all([
      domaServerService.getOrderBookListings(tokenId, false),
      domaServerService.getOrderBookOffers(tokenId, false)
    ])

    // Update domain status based on fresh data
    let updateData: any = {
      updatedAt: new Date()
    }

    // Check if domain has been transferred
    if (domaDomainInfo.owner.toLowerCase() !== domain.owner.toLowerCase()) {
      updateData.owner = domaDomainInfo.owner
    }

    // Check if there are active listings
    const activeListings = listings.filter((listing: any) => 
      !listing.expiresAt || new Date(listing.expiresAt) > new Date()
    )

    if (activeListings.length > 0) {
      // Domain is listed for sale
      const activeListing = activeListings[0] // Take the first active listing
      updateData.forSale = true
      // Convert price from wei (BigInt string) to ETH for both buyNowPrice and price
      // Store buyNowPrice as a string ETH value for consistency
      const ethPrice = formatEther(BigInt(activeListing.price));
      updateData.buyNowPrice = ethPrice;
      // Convert price from wei (BigInt string) to ETH (float) for display/storage
      // Use formatEther as activeListing.price is in wei
      if (activeListing.currency && activeListing.currency.decimals) {
        updateData.price = parseFloat(ethPrice);
      } else {
        updateData.price = parseFloat(ethPrice);
      }
    } else {
      // No active listings
      updateData.forSale = false
      updateData.buyNowPrice = null
      updateData.price = null
    }

    // Update the domain in our database
    const updatedDomain = await prisma.domain.update({
      where: { tokenId },
      data: updateData
    })

    // Update offers if needed
    // Mark expired offers as EXPIRED
    await prisma.offer.updateMany({
      where: {
        domainId: domain.id,
        status: 'PENDING',
        expiry: {
          lt: new Date()
        }
      },
      data: {
        status: 'EXPIRED',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Domain synchronization completed',
      domain: updatedDomain,
      listings: activeListings.length,
      offers: offers.length,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Error in domain synchronization:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}