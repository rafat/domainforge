
import Image from 'next/image';
import { SupabaseChat } from '@/components/landing/SupabaseChat';
import { TemplateProps } from './types';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useDomaMarketplaceData } from '@/hooks/useDomaMarketplaceData';
import { formatUnits } from 'viem';
import { OfferCard } from '@/components/landing/OfferCard';

export function TechTemplate({ domain, customization }: TemplateProps)  {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-1 bg-blue-500/20 rounded-full text-blue-300 text-sm font-medium">
            PREMIUM DOMAIN
          </div>
          <h1 className="text-5xl md:text-7xl font-mono font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {domain.name}
          </h1>
          {domain.title && (
            <p className="text-xl text-gray-300 mb-6">
              {domain.title}
            </p>
          )}
          {domain.description && (
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              {domain.description}
            </p>
          )}
        </div>

        {domain.screenshot && (
          <div className="mb-16">
            <div className="relative max-w-4xl mx-auto border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent z-10"></div>
              <img 
                src={domain.screenshot} 
                alt={`${domain.name} screenshot`}
                className="w-full"
              />
              <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded-lg text-sm">
                PREVIEW
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Technical Information
              </h2>
              <p className="text-gray-300 mb-8">
                This premium domain represents a cutting-edge digital asset on the Doma blockchain. 
                Perfect for technology companies, developers, and innovation-focused businesses.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 p-4 rounded-xl">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm text-gray-400">Token ID</span>
                  </div>
                  <div className="font-mono text-sm">{domain.tokenId}</div>
                </div>
                
                <div className="bg-gray-900/50 p-4 rounded-xl">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm text-gray-400">Owner</span>
                  </div>
                  <div className="font-mono text-sm">{domain.owner}</div>
                </div>
                
                <div className="bg-gray-900/50 p-4 rounded-xl">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    <span className="text-sm text-gray-400">Blockchain</span>
                  </div>
                  <div className="text-gray-300">Doma Testnet</div>
                </div>
                
                {domain.expiry && (
                  <div className="bg-gray-900/50 p-4 rounded-xl">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-400">Expires</span>
                    </div>
                    <div className="text-gray-300">{new Date(domain.expiry).toLocaleDateString()}</div>
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
                  <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-1 shadow-xl">
                    <div className="bg-gray-900 p-6 rounded-2xl">
                      <div className="text-center">
                        <div className="text-sm text-cyan-300 mb-1">Buy Now Price</div>
                        <div className="text-4xl font-mono font-bold mb-6">
                          {formattedPrice} {currencySymbol}
                        </div>
                        <button 
                          onClick={() => handleBuyNow(activeListing)}
                          disabled={isBuying || !isConnected}
                          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          <span className="flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Purchase Domain
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-1">
                    <div className="bg-gray-900 p-6 rounded-2xl">
                      <div className="text-center">
                        <div className="text-sm text-gray-400 mb-1">Not Listed for Sale</div>
                        <p className="text-gray-400 text-sm mb-6">
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
