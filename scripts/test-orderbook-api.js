// scripts/test-orderbook-api.js
// Test script for Orderbook API integration

async function testOrderbookAPI() {
  console.log('🔍 Testing Doma Orderbook API Integration...')
  
  try {
    // Dynamically import the Doma API client
    const domaApiModule = await import('../src/lib/domaApi.ts')
    const { domaApi } = domaApiModule
    
    // Test getting a specific token
    console.log('\n🧪 Testing getToken method...')
    const token = await domaApi.getToken('1')
    console.log('✅ getToken successful')
    console.log(`   Token ID: ${token?.tokenId}`)
    console.log(`   Owner: ${token?.ownerAddress}`)
    console.log(`   Name: ${token?.name?.name}`)
    
    // Test getting offers for a token
    console.log('\n🧪 Testing getOffers method...')
    const offers = await domaApi.getOffers('1')
    console.log('✅ getOffers successful')
    console.log(`   Found ${offers.length} offers`)
    
    // Test getting listings for a token
    console.log('\n🧪 Testing getListings method...')
    const listings = await domaApi.getListings('1')
    console.log('✅ getListings successful')
    console.log(`   Found ${listings.length} listings`)
    
    // Test getting domain activities
    console.log('\n🧪 Testing getDomainActivities method...')
    const activities = await domaApi.getDomainActivities('1', undefined, 10)
    console.log('✅ getDomainActivities successful')
    console.log(`   Found ${activities.length} activities`)
    
    // Test getting orderbook fees (this might fail if we don't have proper permissions)
    console.log('\n🧪 Testing getOrderbookFees method...')
    try {
      const fees = await domaApi.getOrderbookFees('DOMA', 'eip155:97476', token?.tokenAddress || '0x424bDf2E8a6F52Bd2c1C81D9437b0DC0309DF90f')
      console.log('✅ getOrderbookFees successful')
      console.log(`   Fees: ${JSON.stringify(fees)}`)
    } catch (error) {
      console.log('⚠️  getOrderbookFees failed (might be expected due to permissions)')
      console.log(`   Error: ${error.message}`)
    }
    
    // Test getting supported currencies (this might fail if we don't have proper permissions)
    console.log('\n🧪 Testing getSupportedCurrencies method...')
    try {
      const currencies = await domaApi.getSupportedCurrencies('eip155:97476', token?.tokenAddress || '0x424bDf2E8a6F52Bd2c1C81D9437b0DC0309DF90f', 'DOMA')
      console.log('✅ getSupportedCurrencies successful')
      console.log(`   Currencies: ${JSON.stringify(currencies)}`)
    } catch (error) {
      console.log('⚠️  getSupportedCurrencies failed (might be expected due to permissions)')
      console.log(`   Error: ${error.message}`)
    }
    
    console.log('\n🎉 All Orderbook API tests completed!')
    
  } catch (error) {
    console.error('❌ Error testing Orderbook API:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

testOrderbookAPI()