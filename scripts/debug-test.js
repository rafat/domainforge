// scripts/debug-test.js
// Debug test script for Orderbook API integration

async function debugTest() {
  console.log('🔍 Debug testing Doma API Integration...')
  
  try {
    console.log('Testing basic fetch to see if server is running...')
    
    // First, let's just test if we can reach the server
    try {
      const pingResponse = await fetch('http://localhost:3000/api/doma/domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'query { __typename }'
        })
      })
      
      console.log('Ping response status:', pingResponse.status)
      const pingText = await pingResponse.text()
      console.log('Ping response body:', pingText)
    } catch (pingError) {
      console.log('Could not reach server:', pingError.message)
      return
    }
    
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
    
    console.log('Sending names query...')
    const namesResponse = await fetch('http://localhost:3000/api/doma/domains', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: namesQuery
      })
    })
    
    console.log('Names response status:', namesResponse.status)
    
    if (!namesResponse.ok) {
      const errorText = await namesResponse.text()
      console.log('Names response error text:', errorText)
      throw new Error(`HTTP error! status: ${namesResponse.status}`)
    }
    
    const namesResult = await namesResponse.json()
    console.log('Names result:', JSON.stringify(namesResult, null, 2))
    
    if (namesResult.errors) {
      console.error('❌ Names query errors:', namesResult.errors)
      return
    }
    
    console.log('✅ Names query successful')
    
  } catch (error) {
    console.error('❌ Error in debug test:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

debugTest()