// scripts/simple-test.js
// Simple test script for Doma API integration

async function simpleTest() {
  console.log('🔍 Testing Doma API Integration...')
  
  try {
    // Read the domaApi.ts file directly
    const fs = require('fs')
    const path = require('path')
    
    // Get the API key from .env file
    const envPath = path.join(__dirname, '..', '.env')
    const envContent = fs.readFileSync(envPath, 'utf8')
    const apiKey = process.env.DOMA_API_KEY
    
    console.log('API Key:', apiKey ? 'Found' : 'Not found')
    
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
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('✅ GraphQL query successful')
    console.log(`   Token ID: ${result.data?.token?.tokenId}`)
    console.log(`   Owner: ${result.data?.token?.ownerAddress}`)
    console.log(`   Name: ${result.data?.token?.name?.name}`)
    
    console.log('\n🎉 Simple test completed!')
    
  } catch (error) {
    console.error('❌ Error in simple test:', error.message)
  }
}

simpleTest()