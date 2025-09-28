
import Image from 'next/image';
import { SupabaseChat } from '@/components/landing/SupabaseChat';
import { TemplateProps } from './types';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useDomaMarketplaceData } from '@/hooks/useDomaMarketplaceData';
import { formatUnits } from 'viem';
import { OfferCard } from '@/components/landing/OfferCard';

export function ModernTemplate({ domain, customization }: TemplateProps)  {
  const {
    offers,
    listings,
    loadingDomaData,
    domaDataError,
    isBuying,
    handleBuyNow,
    isConnected,
    address,
  } = useDomaMarketplaceData({ tokenId: domain.tokenId });

  // Find the active listing (first one in the array)
  const activeListing = listings && listings.length > 0 ? listings[0] : null;

  // Format the price from wei to ETH if we have a valid listing
  let formattedPrice = '';
  let currencySymbol = 'ETH';
  if (activeListing && activeListing.price && activeListing.currency) {
    try {
      // Convert from wei to ETH
      formattedPrice = formatUnits(BigInt(activeListing.price), activeListing.currency.decimals || 18);
      currencySymbol = activeListing.currency.symbol || 'ETH';
    } catch (error) {
      console.error('Error formatting price:', error);
      // Fallback to raw price if formatting fails
      formattedPrice = activeListing.price;
      currencySymbol = activeListing.currency.symbol || 'ETH';
    }
  }

  // Check if current user is the owner
  const isOwner = isConnected && address && domain.owner.toLowerCase() === address.toLowerCase();

  // Sort offers by price in descending order (highest first)
  const sortedOffers = [...offers].sort((a, b) => {
    try {
      const priceA = BigInt(a.price || '0');
      const priceB = BigInt(b.price || '0');
      return priceB > priceA ? 1 : priceB < priceA ? -1 : 0;
    } catch (err) {
      return 0;
    }
  });

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
                        {formattedPrice} {currencySymbol}
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

                {sortedOffers.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-blue-900">Active Offers ({sortedOffers.length})</h3>
                      <span className="text-sm text-blue-600">Highest first</span>
                    </div>
                    <div className="space-y-4">
                      {sortedOffers.map((offer) => (
                        <OfferCard 
                          key={offer.id} 
                          offer={offer} 
                          isOwner={isOwner}
                          domainId={domain.id}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <SupabaseChat 
              domainId={domain.id} 
              ownerAddress={domain.owner} 
              domainName={domain.name} 
              tokenId={domain.tokenId}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
