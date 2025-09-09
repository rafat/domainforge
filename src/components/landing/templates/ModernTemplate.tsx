
import Image from 'next/image';
import { SupabaseChat } from '@/components/landing/SupabaseChat';
import { TemplateProps } from './types';
import LoadingSpinner from '@/components/LoadingSpinner'; // New import
import { useDomaMarketplaceData } from '@/hooks/useDomaMarketplaceData'; // New import

export function ModernTemplate({ domain, customization }: TemplateProps)  {
  const {
    offers,
    listings,
    loadingDomaData,
    domaDataError,
    isBuying,
    handleBuyNow,
    isConnected,
  } = useDomaMarketplaceData({ tokenId: domain.tokenId });

  const activeListing = listings.length > 0 ? listings[0] : null; // Assuming one active listing for simplicity

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
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
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl transform rotate-1"></div>
              <Image 
                src={domain.screenshot} 
                alt={`${domain.name} screenshot`}
                className="relative w-full rounded-2xl shadow-2xl"
                width={1200}
                height={800}
              />
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">About This Domain</h2>
            <div className="prose max-w-none">
              <p className="text-gray-600">
                This premium domain is available for purchase. {domain.description || 'It offers a unique opportunity for branding and online presence.'}
              </p>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Token ID</div>
                  <div className="font-mono text-sm mt-1">{domain.tokenId.slice(0, 12)}...</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Owner</div>
                  <div className="font-mono text-sm mt-1">{domain.owner.slice(0, 12)}...</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Blockchain</div>
                  <div className="text-gray-900 mt-1">Doma Testnet</div>
                </div>
                {domain.expiry && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Expires</div>
                    <div className="text-gray-900 mt-1">{new Date(domain.expiry).toLocaleDateString()}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {loadingDomaData ? (
              <div className="flex justify-center items-center h-32">
                <LoadingSpinner />
              </div>
            ) : domaDataError ? (
              <div className="text-red-500 text-center p-4 border border-red-200 rounded-lg">
                {domaDataError}
              </div>
            ) : (
              <>
                {activeListing ? (
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="text-center">
                      <div className="text-sm opacity-90 mb-1">Buy Now Price</div>
                      <div className="text-4xl font-bold mb-6">
                        {activeListing.price} {activeListing.currency?.symbol || 'USD'}
                      </div>
                      <button 
                        onClick={() => handleBuyNow(activeListing)}
                        disabled={isBuying || !isConnected}
                        className="w-full bg-white text-green-600 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors disabled:opacity-50"
                      >
                        {isBuying ? 'Purchasing...' : (isConnected ? 'Purchase Domain' : 'Connect Wallet to Purchase')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="text-center">
                      <div className="text-sm opacity-90 mb-1">Not Listed for Sale</div>
                      <p className="text-sm opacity-90 mb-6">
                        Contact the owner to discuss acquisition
                      </p>
                    </div>
                  </div>
                )}

                {offers.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Active Offers ({offers.length})</h3>
                    <ul className="space-y-2">
                      {offers.map((offer, index) => (
                        <li key={index} className="flex justify-between text-gray-700">
                          <span>Offer from {offer.offererAddress.slice(0, 6)}...</span>
                          <span className="font-bold">{offer.price} {offer.currency?.symbol || 'USD'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
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
