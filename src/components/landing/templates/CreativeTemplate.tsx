
import Image from 'next/image';
import { SupabaseChat } from '@/components/landing/SupabaseChat';
import { TemplateProps } from './types';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useDomaMarketplaceData } from '@/hooks/useDomaMarketplaceData';
import { formatUnits } from 'viem';
import { OfferCard } from '@/components/landing/OfferCard';

export function CreativeTemplate({ domain, customization }: TemplateProps)  {
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
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-20 h-20 bg-pink-500 rounded-full blur-xl"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-1/2 w-24 h-24 bg-green-500 rounded-full blur-xl"></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-pulse">
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              {domain.name}
            </span>
          </h1>
          
          {domain.title && (
            <p className="text-3xl mb-6 text-gray-300">
              {domain.title}
            </p>
          )}
          
          {domain.description && (
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              {domain.description}
            </p>
          )}
        </div>

        {domain.screenshot && (
          <div className="mb-16">
            <div className="relative max-w-4xl mx-auto border-4 border-white rounded-2xl overflow-hidden shadow-2xl transform rotate-1">
              <img 
                src={domain.screenshot} 
                alt={`${domain.name} screenshot`}
                className="w-full"
              />
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-blue-400">
              Premium Digital Asset
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              This exceptional domain represents a unique opportunity in the decentralized 
              digital landscape. With its verified blockchain ownership and premium status, 
              it's ready to power your next big project.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
                <div className="text-sm text-gray-400">Blockchain</div>
                <div className="font-medium">Doma Testnet</div>
              </div>
              <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
                <div className="text-sm text-gray-400">Token ID</div>
                <div className="font-mono text-sm">{domain.tokenId.slice(0, 8)}...</div>
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
                  <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 p-1 rounded-2xl">
                    <div className="bg-black p-6 rounded-2xl">
                      <div className="text-center">
                        <div className="text-sm text-gray-400 mb-2">Buy Now Price</div>
                        <div className="text-4xl font-bold mb-6">
                          {formattedPrice} {currencySymbol}
                        </div>
                        <button 
                          onClick={() => handleBuyNow(activeListing)}
                          disabled={isBuying || !isConnected}
                          className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform disabled:opacity-50"
                        >
                          {isBuying ? 'Purchasing...' : (isConnected ? '🚀 Claim This Masterpiece' : 'Connect Wallet to Claim')}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1 rounded-2xl">
                    <div className="bg-black p-6 rounded-2xl">
                      <div className="text-center">
                        <div className="text-sm text-gray-400 mb-2">Not Listed for Sale</div>
                        <p className="text-gray-300 text-sm mb-6">
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
            />
          </div>
        </div>
      </div>
    </div>
  )
}
