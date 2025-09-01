// scripts/find-tokens.js
// Script to find valid token IDs

async function findTokens() {
  console.log('🔍 Finding valid token IDs...')
  
  try {
    // Get the API key from .env file
    const fs = require('fs')
    const path = require('path')
    
    const envPath = path.join(__dirname, '..', '.env')
    const envContent = fs.readFileSync(envPath, 'utf8')
    const apiKeyMatch = envContent.match(/DOMA_API_KEY=(.+)/)
    const apiKey = apiKeyMatch ? apiKeyMatch[1] : 'v1.93ebb5bd6e71f5a67798bf32ef482bd2910964f1a2d6857cd6d59bb68525680b'
    
    // Query to get a list of tokens
    console.log('\n🧪 Querying for tokens...')
    const query = `
      query GetTokens {
        tokens(take: 5) {
          items {
            tokenId
            ownerAddress
            name {
              name
            }
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
        variables: {}
      })
    })
    
    const text = await response.text()
    console.log('Response:', text)
    
    if (response.ok) {
      const result = JSON.parse(text)
      console.log('✅ Successfully retrieved tokens')
      if (result.data?.tokens?.items?.length > 0) {
        console.log('Found tokens:')
        result.data.tokens.items.forEach((token, index) => {
          console.log(`  ${index + 1}. Token ID: ${token.tokenId}, Owner: ${token.ownerAddress}, Name: ${token.name?.name || 'N/A'}`)
        })
      } else {
        console.log('No tokens found')
      }
    } else {
      console.log('Failed to retrieve tokens')
    }
    
    console.log('\n🎉 Token search completed!')
    
  } catch (error) {
    console.error('❌ Error finding tokens:', error.message)
  }
}

findTokens()