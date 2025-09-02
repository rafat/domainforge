// scripts/doma-api-usage-example.js
// Example usage of enhanced Doma API methods

async function demonstrateDomaAPIUsage() {
  console.log('🔍 Demonstrating enhanced Doma API usage...')
  
  try {
    // Note: In a real application, you would import these modules
    // For this example, we'll just show the code structure
    
    console.log('\n=== Example 1: Getting comprehensive domain information ===')
    console.log(`
// Get detailed token information with caching
const token = await domaApi.getToken('123', true);

// The returned token includes:
// - Full registrar information
// - Chain details
// - Listings with currency info
// - Activities with transaction hashes
// - All with proper typing
    `)
    
    console.log('\n=== Example 2: Paginated domain queries ===')
    console.log(`
// Get paginated list of domains with filters
const domains = await domaApi.getNames({
  ownedBy: ['eip155:1:0x123...'],
  tlds: ['eth', 'xyz'],
  take: 20,
  skip: 0,
  sortOrder: 'DESC'
}, true); // with caching

// Access pagination info
console.log(\`Total domains: \${domains.totalCount}\`);
console.log(\`Current page: \${domains.currentPage}\`);
console.log(\`Has next page: \${domains.hasNextPage}\`);
    `)
    
    console.log('\n=== Example 3: Getting domain statistics ===')
    console.log(`
// Get comprehensive domain statistics
const stats = await domaApi.getDomainStatistics('123', true);

console.log(\`Active offers: \${stats.activeOffers}\`);
console.log(\`Offers in last 3 days: \${stats.offersLast3Days}\`);

if (stats.highestOffer) {
  console.log(\`Highest offer: \${stats.highestOffer.price} \${stats.highestOffer.currency.symbol}\`);
}
    `)
    
    console.log('\n=== Example 4: Paginated marketplace data ===')
    console.log(`
// Get paginated listings
const listings = await domaApi.getPaginatedListings({
  tlds: ['eth'],
  createdSince: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
  take: 10,
  skip: 0,
  sortOrder: 'DESC'
}, true);

// Get paginated offers
const offers = await domaApi.getPaginatedOffers({
  status: 'ACTIVE',
  take: 10,
  skip: 0,
  sortOrder: 'DESC'
}, true);
    `)
    
    console.log('\n=== Example 5: Caching benefits ===')
    console.log(`
// First call - fetches from API
const data1 = await domaApi.getToken('123', true);

// Second call - returns from cache (much faster)
const data2 = await domaApi.getToken('123', true);

// Cache automatically expires based on TTL
// Default TTL is 5 minutes but can be customized
    `)
    
    console.log('\n🎉 Demonstration complete!')
    console.log('\n💡 Pro Tips:')
    console.log('1. Always use caching (useCache=true) for frequently accessed data')
    console.log('2. Use pagination for large datasets to improve performance')
    console.log('3. Filter data at the API level rather than fetching everything and filtering client-side')
    console.log('4. Handle pagination metadata to implement infinite scrolling or pagination UI')
    
  } catch (error) {
    console.error('❌ Error in demonstration:', error.message)
  }
}

demonstrateDomaAPIUsage()