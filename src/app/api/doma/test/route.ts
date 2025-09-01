// src/app/api/doma/test/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { domaApi } from '@/lib/domaApi'

export async function GET(request: NextRequest) {
  try {
    // Test getting a specific token
    console.log('Testing getToken method...')
    const token = await domaApi.getToken('1')
    console.log('getToken successful')
    
    // Test getting offers for a token
    console.log('Testing getOffers method...')
    const offers = await domaApi.getOffers('1')
    console.log('getOffers successful')
    
    // Test getting listings for a token
    console.log('Testing getListings method...')
    const listings = await domaApi.getListings('1')
    console.log('getListings successful')
    
    // Test getting domain activities
    console.log('Testing getDomainActivities method...')
    const activities = await domaApi.getDomainActivities('1', undefined, 10)
    console.log('getDomainActivities successful')
    
    const result = {
      success: true,
      token: {
        tokenId: token?.tokenId,
        owner: token?.ownerAddress,
        name: token?.name?.name
      },
      offersCount: offers.length,
      listingsCount: listings.length,
      activitiesCount: activities.length,
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error testing Orderbook API:', error)
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