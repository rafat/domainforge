
import Image from 'next/image';
import { SupabaseChat } from '@/components/landing/SupabaseChat';
import { TemplateProps } from './types';

export function TechTemplate({ domain, customization }: TemplateProps)  {
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span className="text-sm text-gray-400">Token ID</span>
                  </div>
                  <div className="font-mono text-sm">{domain.tokenId}</div>
                </div>
                
                <div className="bg-gray-900/50 p-4 rounded-xl">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
            {domain.forSale && domain.buyNowPrice ? (
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-1 shadow-xl">
                <div className="bg-gray-900 p-6 rounded-2xl">
                  <div className="text-center">
                    <div className="text-sm text-cyan-300 mb-1">Buy Now Price</div>
                    <div className="text-4xl font-mono font-bold mb-6">{domain.buyNowPrice} ETH</div>
                    <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-xl font-bold hover:opacity-90 transition-opacity">
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
