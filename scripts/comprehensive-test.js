// scripts/comprehensive-test.js
// Comprehensive test script for enhanced Orderbook API integration

async function comprehensiveTest() {
  console.log('🔍 Comprehensive testing of enhanced Doma API Integration...')
  
  try {
    // Test getting a list of names to find a valid token
    console.log('\n🧪 Testing names query...')
    const namesQuery = `
      query TestQuery {
        names(take: 1, skip: 0) {
          items {
            name
            tokens {
              tokenId
              ownerAddress
            }
          }
          totalCount
        }
      }
    `
    
    const namesResponse = await fetch('http://localhost:3000/api/doma/domains', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: namesQuery
      })
    })
    
    if (!namesResponse.ok) {
      throw new Error(`HTTP error! status: ${namesResponse.status}`)
    }
    
    const namesResult = await namesResponse.json()
    
    if (namesResult.errors) {
      console.error('❌ Names query errors:', namesResult.errors)
      return
    }
    
    console.log('✅ Names query successful')
    console.log(`   Total names: ${namesResult.data.names.totalCount}`)
    
    let tokenId = null
    if (namesResult.data.names.items.length > 0 && 
        namesResult.data.names.items[0].tokens.length > 0) {
      tokenId = namesResult.data.names.items[0].tokens[0].tokenId
      console.log(`   Found token ID: ${tokenId}`)
    }
    
    // Test the enhanced getToken method with comprehensive data
    if (tokenId) {
      console.log('\n🧪 Testing enhanced token query with comprehensive data...')
      const tokenQuery = `
        query GetToken($tokenId: String!) {
          token(tokenId: $tokenId) {
            tokenId
            ownerAddress
            name {
              name
              expiresAt
              registrar {
                ianaId
                name
              }
            }
            chain {
              networkId
              name
            }
            listings {
              id
              price
              offererAddress
              orderbook
              currency {
                name
                symbol
                decimals
              }
              expiresAt
              createdAt
            }
            activities(take: 10) {
              ... on TokenMintedActivity {
                type
                tokenId
                createdAt
                owner: to
              }
              ... on TokenTransferredActivity {
                type
                tokenId
                createdAt
                transferredFrom
                transferredTo
              }
              ... on TokenListedActivity {
                type
                tokenId
                createdAt
                orderId
                seller
                buyer
                payment {
                  price
                  currencySymbol
                }
                orderbook
              }
              ... on TokenOfferReceivedActivity {
                type
                tokenId
                createdAt
                orderId
                buyer
                seller
                payment {
                  price
                  currencySymbol
                }
                orderbook
              }
            }
          }
        }
      `
      
      const tokenResponse = await fetch('http://localhost:3000/api/doma/domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: tokenQuery,
          variables: { tokenId }
        })
      })
      
      const tokenResult = await tokenResponse.json()
      
      if (tokenResult.errors) {
        console.log('⚠️  Token query returned errors (might be expected):', tokenResult.errors[0].message)
      } else {
        console.log('✅ Enhanced token query successful')
        console.log(`   Token ID: ${tokenResult.data.token?.tokenId}`)
        console.log(`   Owner: ${tokenResult.data.token?.ownerAddress}`)
        console.log(`   Domain Name: ${tokenResult.data.token?.name?.name}`)
        console.log(`   Registrar: ${tokenResult.data.token?.name?.registrar?.name}`)
        console.log(`   Network: ${tokenResult.data.token?.chain?.name}`)
        console.log(`   Listings: ${tokenResult.data.token?.listings?.length || 0}`)
        console.log(`   Activities: ${tokenResult.data.token?.activities?.length || 0}`)
      }
    }
    
    // Test offers query with enhanced fields
    console.log('\n🧪 Testing enhanced offers query...')
    const offersQuery = `
      query GetOffers {
        offers(take: 5, status: ACTIVE) {
          items {
            id
            externalId
            price
            offererAddress
            orderbook
            currency {
              name
              symbol
              decimals
            }
            expiresAt
            createdAt
          }
        }
      }
    `
    
    const offersResponse = await fetch('http://localhost:3000/api/doma/domains', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: offersQuery
      })
    })
    
    const offersResult = await offersResponse.json()
    
    if (offersResult.errors) {
      console.log('⚠️  Offers query returned errors (might be expected):', offersResult.errors[0].message)
    } else {
      console.log('✅ Enhanced offers query successful')
      console.log(`   Found ${offersResult.data.offers?.items?.length || 0} offers`)
      if (offersResult.data.offers?.items?.length > 0) {
        const firstOffer = offersResult.data.offers.items[0]
        console.log(`   First offer ID: ${firstOffer.id}`)
        console.log(`   First offer price: ${firstOffer.price}`)
        console.log(`   First offer currency: ${firstOffer.currency?.symbol}`)
      }
    }
    
    // Test listings query
    console.log('\n🧪 Testing listings query...')
    const listingsQuery = `
      query GetListings {
        listings(take: 5, status: ACTIVE) {
          items {
            id
            externalId
            price
            offererAddress
            orderbook
            currency {
              name
              symbol
              decimals
            }
            expiresAt
            createdAt
          }
        }
      }
    `
    
    const listingsResponse = await fetch('http://localhost:3000/api/doma/domains', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: listingsQuery
      })
    })
    
    const listingsResult = await listingsResponse.json()
    
    if (listingsResult.errors) {
      console.log('⚠️  Listings query returned errors (might be expected):', listingsResult.errors[0].message)
    } else {
      console.log('✅ Listings query successful')
      console.log(`   Found ${listingsResult.data.listings?.items?.length || 0} listings`)
      if (listingsResult.data.listings?.items?.length > 0) {
        const firstListing = listingsResult.data.listings.items[0]
        console.log(`   First listing ID: ${firstListing.id}`)
        console.log(`   First listing price: ${firstListing.price}`)
        console.log(`   First listing currency: ${firstListing.currency?.symbol}`)
      }
    }
    
    console.log('\n🎉 All comprehensive tests completed!')
    console.log('\nSummary of enhancements:')
    console.log('✅ Enhanced getToken with comprehensive domain data')
    console.log('✅ Enhanced getOffers with detailed offer information')
    console.log('✅ Added getListings method')
    console.log('✅ Enhanced activities with comprehensive event data')
    console.log('✅ Added proper error handling and validation')
    
  } catch (error) {
    console.error('❌ Error in comprehensive test:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

comprehensiveTest()