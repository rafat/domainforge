// scripts/test-orderbook-api-fixed.js
// Fixed test script for Orderbook API integration that works with Node.js

async function testOrderbookAPI() {
  console.log('🔍 Testing Doma Orderbook API Integration...')
  
  try {
    // Instead of importing TypeScript directly, we'll use the API through REST calls
    console.log('\n🧪 Testing direct REST API calls to Orderbook API...')
    
    // Get the API key from environment
    const apiKey = process.env.DOMA_API_KEY || 'v1.xxxx';
    const apiUrl = 'https://api-testnet.doma.xyz';
    const graphqlUrl = 'https://api-testnet.doma.xyz/graphql';
    
    // First, get a valid token ID from the GraphQL API
    console.log('\n🧪 Getting a valid token ID from GraphQL API...')
    const namesQuery = `
      query GetNames($take: Int) {
        names(take: $take, skip: 0) {
          items {
            tokens {
              tokenId
              tokenAddress
            }
          }
        }
      }
    `;
    
    const namesResponse = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: namesQuery,
        variables: { take: 1 }
      })
    });
    
    if (!namesResponse.ok) {
      throw new Error(`GraphQL API error: ${namesResponse.status}`);
    }
    
    const namesData = await namesResponse.json();
    
    if (namesData.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(namesData.errors)}`);
    }
    
    const token = namesData.data.names.items[0]?.tokens[0];
    const tokenId = token?.tokenId;
    const tokenAddress = token?.tokenAddress;
    
    if (!tokenId) {
      throw new Error('No valid token ID found');
    }
    
    console.log('✅ Found valid token ID');
    console.log(`   Token ID: ${tokenId.substring(0, 20)}...`);
    console.log(`   Token Address: ${tokenAddress}`);
    
    // Test getting offers for a token using GraphQL
    console.log('\n🧪 Testing offers query via GraphQL...')
    const offersQuery = `
      query GetOffers($tokenId: String!, $status: OfferStatus) {
        offers(tokenId: $tokenId, status: $status, sortOrder: DESC) {
          items {
            id
            price
            offererAddress
          }
        }
      }
    `;
    
    const offersResponse = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: offersQuery,
        variables: { 
          tokenId: tokenId,
          status: 'ACTIVE'
        }
      })
    });
    
    if (offersResponse.ok) {
      const offersData = await offersResponse.json();
      console.log('✅ Offers query successful');
      console.log(`   Found ${offersData.data?.offers?.items?.length || 0} offers`);
    } else {
      console.log('⚠️  Offers query failed');
      console.log(`   Status: ${offersResponse.status}`);
    }
    
    // Test getting listings for a token using GraphQL
    console.log('\n🧪 Testing listings query via GraphQL...')
    const listingsQuery = `
      query GetListings($tokenId: String!, $status: OfferStatus) {
        listings(tokenId: $tokenId, status: $status, sortOrder: DESC) {
          items {
            id
            price
            offererAddress
          }
        }
      }
    `;
    
    const listingsResponse = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: listingsQuery,
        variables: { 
          tokenId: tokenId,
          status: 'ACTIVE'
        }
      })
    });
    
    if (listingsResponse.ok) {
      const listingsData = await listingsResponse.json();
      console.log('✅ Listings query successful');
      console.log(`   Found ${listingsData.data?.listings?.items?.length || 0} listings`);
    } else {
      console.log('⚠️  Listings query failed');
      console.log(`   Status: ${listingsResponse.status}`);
    }
    
    console.log('\n🎉 Orderbook API test completed!');
    
  } catch (error) {
    console.error('❌ Error testing Orderbook API:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testOrderbookAPI();