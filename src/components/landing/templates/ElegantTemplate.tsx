
import Image from 'next/image';
import { SupabaseChat } from '@/components/landing/SupabaseChat';
import { TemplateProps } from './types';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useDomaMarketplaceData } from '@/hooks/useDomaMarketplaceData';
import { formatUnits } from 'viem';
import { OfferCard } from '@/components/landing/OfferCard';

export function ElegantTemplate({ domain, customization }: TemplateProps) {
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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-serif font-light text-gray-900 mb-6">
            {domain.name}
          </h1>
          {domain.title && (
            <p className="text-xl text-gray-700 mb-6">
              {domain.title}
            </p>
          )}
          {domain.description && (
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              {domain.description}
            </p>
          )}
        </div>

        {domain.screenshot && (
          <div className="mb-16">
            <div className="relative max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-xl">
              <img 
                src={domain.screenshot} 
                alt={`${domain.name} screenshot`}
                className="w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto items-center">
          <div>
            <h2 className="text-3xl font-serif font-light text-gray-900 mb-6">Premium Domain</h2>
            <p className="text-gray-600 mb-8">
              This exceptional domain represents a sophisticated digital asset on the Doma blockchain. 
              With its verified ownership and premium status, it's perfectly suited for luxury brands 
              and high-end businesses.
            </p>
            
            <div className="space-y-4">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-600">Token ID</span>
                <span className="font-mono text-sm">{domain.tokenId.slice(0, 10)}...</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-600">Owner</span>
                <span className="font-mono text-sm">{domain.owner.slice(0, 10)}...</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-600">Blockchain</span>
                <span className="text-gray-900">Doma Testnet</span>
              </div>
              {domain.expiry && (
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Expires</span>
                  <span className="text-gray-900">{new Date(domain.expiry).toLocaleDateString()}</span>
                </div>
              )}
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
                  <div className="bg-gradient-to-br from-amber-400 to-rose-500 rounded-2xl shadow-lg p-1">
                    <div className="bg-white p-6 rounded-2xl">
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">Buy Now Price</div>
                        <div className="text-4xl font-serif font-light text-gray-900 mb-6">
                          {formattedPrice} {currencySymbol}
                        </div>
                        <button 
                          onClick={() => handleBuyNow(activeListing)}
                          disabled={isBuying || !isConnected}
                          className="w-full bg-gradient-to-r from-amber-500 to-rose-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          {isBuying ? 'Purchasing...' : (isConnected ? 'Acquire Domain' : 'Connect Wallet to Acquire')}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl shadow-lg p-1">
                    <div className="bg-white p-6 rounded-2xl">
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">Not Listed for Sale</div>
                        <p className="text-gray-600 text-sm mb-6">
                          Contact the owner to discuss acquisition
                        </p>
                      </div>
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
