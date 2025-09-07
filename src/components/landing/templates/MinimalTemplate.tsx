
import Image from 'next/image';
import { SupabaseChat } from '@/components/landing/SupabaseChat';
import { TemplateProps } from './types';

export function MinimalTemplate({ domain, customization }: TemplateProps)  {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {domain.name}
          </h1>
          {domain.title && (
            <p className="text-xl text-gray-600 mb-6">
              {domain.title}
            </p>
          )}
          {domain.description && (
            <p className="text-gray-500 max-w-2xl mx-auto">
              {domain.description}
            </p>
          )}
        </div>

        {domain.screenshot && (
          <div className="mb-12">
            <Image 
              src={domain.screenshot} 
              alt={`${domain.name} screenshot`}
              className="w-full max-w-3xl mx-auto rounded-lg shadow-lg"
              width={800}
              height={600}
            />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Domain Details</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">Token ID</dt>
                <dd className="font-mono text-sm">{domain.tokenId.slice(0, 10)}...</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Owner</dt>
                <dd className="font-mono text-sm">{domain.owner.slice(0, 10)}...</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Blockchain</dt>
                <dd className="text-gray-900">Doma Testnet</dd>
              </div>
              {domain.expiry && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Expires</dt>
                  <dd className="text-gray-900">{new Date(domain.expiry).toLocaleDateString()}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="space-y-6">
            {domain.forSale && domain.buyNowPrice && (
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-green-700 mb-1">Buy Now Price</div>
                  <div className="text-3xl font-bold text-green-800">{domain.buyNowPrice} ETH</div>
                  <button className="mt-4 w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700">
                    Buy Now
                  </button>
                </div>
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
