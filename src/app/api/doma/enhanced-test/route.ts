// src/app/api/doma/enhanced-test/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { domaApi } from '@/lib/domaApi'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing enhanced Doma API methods...')
    
    // Test 1: Get a token with enhanced data
    console.log('Testing getToken method...')
    const token = await domaApi.getToken('1', true) // with caching
    console.log('getToken successful')
    
    // Test 2: Get names with pagination
    console.log('Testing getNames method...')
    const names = await domaApi.getNames({
      take: 5,
      skip: 0,
      sortOrder: 'DESC'
    }, true) // with caching
    console.log('getNames successful')
    
    // Test 3: Get domain by name
    console.log('Testing getDomainByName method...')
    const domainByName = await domaApi.getDomainByName(token?.name?.name || 'test.domain', true) // with caching
    console.log('getDomainByName successful')
    
    // Test 4: Get domain activities
    console.log('Testing getDomainActivities method...')
    const activities = await domaApi.getDomainActivities('1', undefined, 10, true) // with caching
    console.log('getDomainActivities successful')
    
    // Test 5: Get domain statistics
    console.log('Testing getDomainStatistics method...')
    const stats = await domaApi.getDomainStatistics('1', true) // with caching
    console.log('getDomainStatistics successful')
    
    // Test 6: Get paginated listings
    console.log('Testing getPaginatedListings method...')
    const listings = await domaApi.getPaginatedListings({
      take: 5,
      skip: 0,
      sortOrder: 'DESC'
    }, true) // with caching
    console.log('getPaginatedListings successful')
    
    // Test 7: Get paginated offers
    console.log('Testing getPaginatedOffers method...')
    const offers = await domaApi.getPaginatedOffers({
      take: 5,
      skip: 0,
      status: 'ACTIVE',
      sortOrder: 'DESC'
    }, true) // with caching
    console.log('getPaginatedOffers successful')
    
    const result = {
      success: true,
      token: {
        tokenId: token?.tokenId,
        owner: token?.ownerAddress,
        name: token?.name?.name
      },
      namesCount: names.items?.length,
      domainByName: {
        name: domainByName?.name,
        registrar: domainByName?.registrar?.name
      },
      activitiesCount: activities.items?.length,
      stats: {
        name: stats?.name,
        activeOffers: stats?.activeOffers
      },
      listingsCount: listings.items?.length,
      offersCount: offers.items?.length,
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error testing enhanced Doma API:', error)
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