// scripts/test-doma-api.js

async function testDomaAPI() {
  console.log('🔍 Testing Doma GraphQL API...')
  
  // Simple test query to get a few names
  const query = `
    query TestQuery {
      names(take: 3, skip: 0) {
        items {
          name
          expiresAt
          tokenizedAt
          registrar {
            name
            ianaId
          }
          tokens {
            tokenId
            networkId
            ownerAddress
            type
          }
        }
        totalCount
      }
    }
  `

  try {
    const response = await fetch('http://localhost:3000/api/doma/domains', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.errors) {
      console.error('❌ GraphQL errors:', result.errors)
      return
    }

    console.log('✅ Doma API is accessible!')
    console.log(`📊 Total names in database: ${result.data.names.totalCount}`)
    console.log('📝 Sample names:')
    
    result.data.names.items.forEach((name, index) => {
      console.log(`  ${index + 1}. ${name.name} (${name.registrar.name})`)
      console.log(`     - Tokens: ${name.tokens.length}`)
      console.log(`     - Expires: ${new Date(name.expiresAt).toLocaleDateString()}`)
    })

    console.log('\n🧪 Testing with specific owner address...')
    
    // Test with a specific owner address
    const ownerQuery = `
      query TestOwnerQuery($ownedBy: [AddressCAIP10!]!) {
        names(ownedBy: $ownedBy, take: 10) {
          items {
            name
            tokens {
              ownerAddress
              tokenId
            }
          }
          totalCount
        }
      }
    `

    const testAddress = 'eip155:1:0x1234567890123456789012345678901234567890'
    const ownerResponse = await fetch('http://localhost:3000/api/doma/domains', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: ownerQuery,
        variables: {
          ownedBy: [testAddress]
        }
      })
    })

    const ownerResult = await ownerResponse.json()
    
    if (ownerResult.errors) {
      console.error('❌ Owner query errors:', ownerResult.errors)
    } else {
      console.log(`📊 Domains for ${testAddress}: ${ownerResult.data.names.totalCount}`)
    }

  } catch (error) {
    console.error('❌ Error testing Doma API:', error.message)
  }
}

testDomaAPI()