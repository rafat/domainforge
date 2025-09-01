// scripts/seed-domains.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Sample wallet addresses for testing
  const sampleAddresses = [
    '0x1234567890123456789012345678901234567890',
    '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    '0x9876543210987654321098765432109876543210'
  ]

  // Sample domains data
  const sampleDomains = [
    {
      name: 'example.doma',
      tokenId: 'token_001',
      owner: sampleAddresses[0],
      contractAddress: '0xf6a92e0f8bea4174297b0219d9d47fee335f84f8',
      chainId: 421614, // Arbitrum Sepolia testnet
      title: 'Example Domain',
      description: 'A premium example domain perfect for your business.',
      forSale: true,
      price: 1.5,
      acceptOffers: true
    },
    {
      name: 'blockchain.doma',
      tokenId: 'token_002', 
      owner: sampleAddresses[0],
      contractAddress: '0xf6a92e0f8bea4174297b0219d9d47fee335f84f8',
      chainId: 421614,
      title: 'Blockchain Domain',
      description: 'Perfect for crypto and blockchain projects.',
      forSale: true,
      price: 2.0,
      acceptOffers: true
    },
    {
      name: 'defi.doma',
      tokenId: 'token_003',
      owner: sampleAddresses[1],
      contractAddress: '0xf6a92e0f8bea4174297b0219d9d47fee335f84f8',
      chainId: 421614,
      title: 'DeFi Domain',
      description: 'Ideal for decentralized finance applications.',
      forSale: false,
      acceptOffers: true
    },
    {
      name: 'web3.doma',
      tokenId: 'token_004',
      owner: sampleAddresses[0],
      contractAddress: '0xf6a92e0f8bea4174297b0219d9d47fee335f84f8',
      chainId: 421614,
      title: 'Web3 Domain',
      description: 'Great for Web3 startups and projects.',
      forSale: true,
      price: 3.0,
      acceptOffers: true
    },
    {
      name: 'nft.doma',
      tokenId: 'token_005',
      owner: sampleAddresses[2],
      contractAddress: '0xf6a92e0f8bea4174297b0219d9d47fee335f84f8',
      chainId: 421614,
      title: 'NFT Domain',
      description: 'Perfect for NFT marketplaces and collections.',
      forSale: true,
      price: 1.2,
      acceptOffers: true
    }
  ]

  console.log('🌱 Seeding domain data...')

  for (const domainData of sampleDomains) {
    try {
      // Check if domain already exists
      const existing = await prisma.domain.findUnique({
        where: { name: domainData.name }
      })

      if (existing) {
        console.log(`⏭️  Domain ${domainData.name} already exists, skipping...`)
        continue
      }

      const domain = await prisma.domain.create({
        data: domainData
      })

      console.log(`✅ Created domain: ${domain.name} (${domain.tokenId})`)
    } catch (error) {
      console.error(`❌ Error creating domain ${domainData.name}:`, error)
    }
  }

  const totalDomains = await prisma.domain.count()
  console.log(`\n🎉 Seeding complete! Total domains in database: ${totalDomains}`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })