// scripts/corrected-test.js
// Corrected test script for Doma API integration

async function correctedTest() {
  console.log('🔍 Testing Doma API Integration...')
  
  try {
    // Read the domaApi.ts file directly
    const fs = require('fs')
    const path = require('path')
    
    // Get the API key from .env file
    const envPath = path.join(__dirname, '..', '.env')
    const envContent = fs.readFileSync(envPath, 'utf8')
    const apiKey= process.env.DOMA_API_KEY


    // Test direct GraphQL query with correct schema
    console.log('\n🧪 Testing direct GraphQL query with correct schema...')
    const query = `
      query GetToken($tokenId: String!) {
        token(tokenId: $tokenId) {
          tokenId
          ownerAddress
          name {
            name
          }
        }
      }
    `
    
    console.log('Query:', query)
    console.log('Variables:', { tokenId: '1' })
    
    const response = await fetch('https://api-testnet.doma.xyz/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
      },
      body: JSON.stringify({
        query,
        variables: { tokenId: '1' }
      })
    })
    
    console.log('Response status:', response.status)
    
    const text = await response.text()
    console.log('Response body:', text)
    
    if (!response.ok) {
      console.log('Trying a simpler query...')
      // Try a simpler query
      const simpleQuery = `
        query GetToken($tokenId: String!) {
          token(tokenId: $tokenId) {
            tokenId
            ownerAddress
          }
        }
      `
      
      const simpleResponse = await fetch('https://api-testnet.doma.xyz/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': apiKey,
        },
        body: JSON.stringify({
          query: simpleQuery,
          variables: { tokenId: '1' }
        })
      })
      
      const simpleText = await simpleResponse.text()
      console.log('Simple query response:', simpleText)
      
      if (!simpleResponse.ok) {
        throw new Error(`HTTP error! status: ${simpleResponse.status}`)
      }
      
      const simpleResult = JSON.parse(simpleText)
      console.log('✅ Simple GraphQL query successful')
      console.log(`   Token ID: ${simpleResult.data?.token?.tokenId}`)
      console.log(`   Owner: ${simpleResult.data?.token?.ownerAddress}`)
    } else {
      const result = JSON.parse(text)
      console.log('✅ GraphQL query successful')
      console.log(`   Token ID: ${result.data?.token?.tokenId}`)
      console.log(`   Owner: ${result.data?.token?.ownerAddress}`)
      console.log(`   Name: ${result.data?.token?.name?.name}`)
    }
    
    console.log('\n🎉 Corrected test completed!')
    
  } catch (error) {
    console.error('❌ Error in corrected test:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

correctedTest()