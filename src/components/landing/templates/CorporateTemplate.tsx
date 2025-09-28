import Image from 'next/image';
import { SupabaseChat } from '@/components/landing/SupabaseChat';
import { TemplateProps } from './types';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useDomaMarketplaceData } from '@/hooks/useDomaMarketplaceData';
import { formatUnits } from 'viem';
import { OfferCard } from '@/components/landing/OfferCard';

export function CorporateTemplate({ domain, customization }: TemplateProps) {
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
                  <div className="bg-white rounded-lg shadow-sm p-6 border border-green-200">
                    <h3 className="font-bold text-gray-900 mb-4">Purchase Information</h3>
                    <div className="text-center mb-6">
                      <div className="text-sm text-gray-600 mb-1">Buy Now Price</div>
                      <div className="text-3xl font-bold text-green-600">
                        {formattedPrice} {currencySymbol}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleBuyNow(activeListing)}
                      disabled={isBuying || !isConnected}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      {isBuying ? 'Purchasing...' : (isConnected ? 'Acquire Domain' : 'Connect Wallet to Acquire')}
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