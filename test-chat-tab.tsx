// Test file to verify chat tab integration
import { SupabaseChat } from '@/components/landing/SupabaseChat'

// Mock domain data to test the component
const mockDomain = {
  id: 'test-domain-id',
  name: 'test.domain',
  tokenId: '123456789',
  owner: '0x1234567890123456789012345678901234567890'
}

export default function TestChatTab() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Chat Tab Test</h1>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Chat with Owner</h2>
        <div className="h-96">
          <SupabaseChat 
            domainId={mockDomain.id} 
            ownerAddress={mockDomain.owner} 
            domainName={mockDomain.name} 
            tokenId={mockDomain.tokenId} 
          />
        </div>
      </div>
    </div>
  )
}