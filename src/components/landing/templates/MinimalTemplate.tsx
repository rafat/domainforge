
import Image from 'next/image';
import { SupabaseChat } from '@/components/landing/SupabaseChat';
import { TemplateProps } from './types';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useDomaMarketplaceData } from '@/hooks/useDomaMarketplaceData';
import { formatUnits } from 'viem';
import { OfferCard } from '@/components/landing/OfferCard';

export function MinimalTemplate({ domain, customization }: TemplateProps) {
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
                  <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm text-green-700 mb-1">Buy Now Price</div>
                      <div className="text-3xl font-bold text-green-800">
                        {formattedPrice} {currencySymbol}
                      </div>
                      <button 
                        onClick={() => handleBuyNow(activeListing)}
                        disabled={isBuying || !isConnected}
                        className="mt-4 w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        {isBuying ? 'Buying...' : (isConnected ? 'Buy Now' : 'Connect Wallet to Buy')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg text-center">
                    <div className="text-sm text-blue-700 mb-1">Not Listed for Sale</div>
                    <p className="text-sm text-gray-600">
                      Contact the owner to discuss acquisition
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
