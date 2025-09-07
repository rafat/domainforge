import Image from 'next/image';
import { SupabaseChat } from '@/components/landing/SupabaseChat';
import { TemplateProps } from './types';

export function CorporateTemplate({ domain, customization }: TemplateProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-bold text-xl text-gray-900">DomainForge</div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {domain.name}
          </h1>
          {domain.title && (
            <p className="text-2xl text-gray-700 mb-6">
              {domain.title}
            </p>
          )}
          {domain.description && (
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              {domain.description}
            </p>
          )}
        </div>

        {domain.screenshot && (
          <div className="mb-16">
            <img 
              src={domain.screenshot} 
              alt={`${domain.name} screenshot`}
              className="w-full max-w-5xl mx-auto rounded-lg shadow-lg"
            />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Domain Overview</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  This premium domain represents a valuable digital asset on the Doma blockchain. 
                  With its unique characteristics and verified ownership, it offers significant 
                  potential for branding and online presence.
                </p>
                
                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Key Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600">Token ID</div>
                    <div className="font-mono text-sm mt-1">{domain.tokenId}</div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600">Owner</div>
                    <div className="font-mono text-sm mt-1">{domain.owner}</div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600">Blockchain</div>
                    <div className="text-gray-900 mt-1">Doma Testnet</div>
                  </div>
                  {domain.expiry && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Expiration Date</div>
                      <div className="text-gray-900 mt-1">{new Date(domain.expiry).toLocaleDateString()}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {domain.forSale && domain.buyNowPrice ? (
              <div className="bg-white rounded-lg shadow-sm p-6 border border-green-200">
                <h3 className="font-bold text-gray-900 mb-4">Purchase Information</h3>
                <div className="text-center mb-6">
                  <div className="text-sm text-gray-600 mb-1">Buy Now Price</div>
                  <div className="text-3xl font-bold text-green-600">{domain.buyNowPrice} ETH</div>
                </div>
                <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700">
                  Acquire Domain
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 border border-blue-200">
                <h3 className="font-bold text-gray-900 mb-4">Inquiry Information</h3>
                <p className="text-gray-600 text-sm mb-6">
                  This domain is not currently listed for sale. Contact the owner to discuss acquisition.
                </p>
              </div>
            )}

            <SupabaseChat 
              domainId={domain.id} 
              ownerAddress={domain.owner} 
              domainName={domain.name} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}