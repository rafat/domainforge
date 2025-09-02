// scripts/detailed-test.js
// Detailed test script for Doma API integration

async function detailedTest() {
  console.log('🔍 Testing Doma API Integration...')
  
  try {
    // Read the domaApi.ts file directly
    const fs = require('fs')
    const path = require('path')
    
    // Get the API key from .env file
    const envPath = path.join(__dirname, '..', '.env')
    const envContent = fs.readFileSync(envPath, 'utf8')
    const apiKey = process

    
    // Test direct GraphQL query
    console.log('\n🧪 Testing direct GraphQL query...')
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
    console.log('Response headers:', [...response.headers.entries()])
    
    const text = await response.text()
    console.log('Response body:', text)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = JSON.parse(text)
    console.log('✅ GraphQL query successful')
    console.log(`   Token ID: ${result.data?.token?.tokenId}`)
    console.log(`   Owner: ${result.data?.token?.ownerAddress}`)
    console.log(`   Name: ${result.data?.token?.name?.name}`)
    
    console.log('\n🎉 Detailed test completed!')
    
  } catch (error) {
    console.error('❌ Error in detailed test:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

detailedTest()