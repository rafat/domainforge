// Test file to verify buy functionality fixes
import { DomaDomain } from '@/types/doma'

// Test cases for price handling
const testDomains: DomaDomain[] = [
  {
    // Domain with buyNowPrice
    id: '1',
    name: 'test1.domain',
    tokenId: '123',
    tokenAddress: '0x123',
    owner: '0xowner1',
    contractAddress: '0xcontract1',
    chainId: 1,
    registrationDate: new Date(),
    expiry: new Date(),
    title: null,
    description: null,
    template: 'minimal',
    customCSS: null,
    isActive: true,
    screenshot: null,
    metaTitle: null,
    metaDescription: null,
    buyNowPrice: '1.5',
    acceptOffers: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    views: 0,
    forSale: true,
    price: '1.2',
    records: [],
    offers: []
  },
  {
    // Domain with only price (no buyNowPrice)
    id: '2',
    name: 'test2.domain',
    tokenId: '456',
    tokenAddress: '0x456',
    owner: '0xowner2',
    contractAddress: '0xcontract2',
    chainId: 1,
    registrationDate: new Date(),
    expiry: new Date(),
    title: null,
    description: null,
    template: 'minimal',
    customCSS: null,
    isActive: true,
    screenshot: null,
    metaTitle: null,
    metaDescription: null,
    buyNowPrice: null,
    acceptOffers: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    views: 0,
    forSale: true,
    price: '2.0',
    records: [],
    offers: []
  },
  {
    // Domain not for sale
    id: '3',
    name: 'test3.domain',
    tokenId: '789',
    tokenAddress: '0x789',
    owner: '0xowner3',
    contractAddress: '0xcontract3',
    chainId: 1,
    registrationDate: new Date(),
    expiry: new Date(),
    title: null,
    description: null,
    template: 'minimal',
    customCSS: null,
    isActive: true,
    screenshot: null,
    metaTitle: null,
    metaDescription: null,
    buyNowPrice: null,
    acceptOffers: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    views: 0,
    forSale: false,
    price: null,
    records: [],
    offers: []
  }
]

// Test price selection logic
testDomains.forEach((domain, index) => {
  const displayPrice = domain.buyNowPrice || domain.price
  console.log(`Test ${index + 1}: ${domain.name}`)
  console.log(`  buyNowPrice: ${domain.buyNowPrice}`)
  console.log(`  price: ${domain.price}`)
  console.log(`  Display price: ${displayPrice}`)
  console.log(`  For sale: ${domain.forSale}`)
  console.log('')
})

export default function TestBuyFunctionality() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Buy Functionality Test</h1>
      <p>Check console for test results</p>
    </div>
  )
}