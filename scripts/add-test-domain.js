// scripts/add-test-domain.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Add a domain for the current test address
  const testAddress = '0x2EB8291d3a6b72cf55B000610B6485b68783D330'
  
  const newDomain = {
    name: 'test.doma',
    tokenId: 'token_test_001',
    owner: testAddress,
    contractAddress: '0xf6a92e0f8bea4174297b0219d9d47fee335f84f8',
    chainId: 421614, // Arbitrum Sepolia testnet
    title: 'Test Domain',
    description: 'A test domain for your current wallet address.',
    forSale: true,
    price: 0.5,
    acceptOffers: true
  }

  try {
    // Check if domain already exists
    const existing = await prisma.domain.findUnique({
      where: { name: newDomain.name }
    })

    if (existing) {
      console.log(`⏭️  Domain ${newDomain.name} already exists, skipping...`)
    } else {
      const domain = await prisma.domain.create({
        data: newDomain
      })
      console.log(`✅ Created test domain: ${domain.name} for address ${testAddress}`)
    }

    // Show all domains for this address
    const userDomains = await prisma.domain.findMany({
      where: { 
        owner: {
          equals: testAddress,
          mode: 'insensitive'
        }
      }
    })

    console.log(`\n📊 Domains for address ${testAddress}:`)
    userDomains.forEach(domain => {
      console.log(`  - ${domain.name} (${domain.tokenId}) - ${domain.forSale ? `${domain.price} ETH` : 'Not for sale'}`)
    })

  } catch (error) {
    console.error(`❌ Error:`, error)
  }
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })