// src/app/landing/[tokenId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useWallet } from '@/hooks/useWallet'
import { useDoma } from '@/hooks/useDoma'
import { ChatWidget } from '@/components/chat/ChatWidget'
import LoadingSpinner from '@/components/LoadingSpinner'
import { DomaDomain as Domain } from '@/types/doma'

export default function LandingPage() {
  const { tokenId } = useParams()
  const { address, isConnected } = useWallet()
  const { getDomainMetadata } = useDoma()
  const [domain, setDomain] = useState<Domain | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (tokenId) {
      fetchDomainData()
    }
  }, [tokenId])

  const fetchDomainData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // First try to get from our database
      const dbResponse = await fetch(`/api/domain/${tokenId}`)
      if (dbResponse.ok) {
        const dbDomain = await dbResponse.json()
        setDomain(dbDomain)
        return
      }
      
      // If not in database, try to get from blockchain
      const chainData = await getDomainMetadata(tokenId as string)
      setDomain({
        id: tokenId as string,
        name: chainData.metadata?.name || `domain-${tokenId}`,
        tokenId: tokenId as string,
        owner: chainData.owner,
        contractAddress: '', // Will be filled from env
        chainId: 97476, // Doma testnet
        registrationDate: new Date(),
        expiry: chainData.expirationDate || null,
        title: chainData.metadata?.title || null,
        description: chainData.metadata?.description || null,
        template: 'minimal',
        customCSS: null,
        isActive: true,
        screenshot: null,
        metaTitle: null,
        metaDescription: null,
        buyNowPrice: null,
        acceptOffers: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 0,
        forSale: true,
        price: null,
        records: [],
        offers: []
      } as Domain)
    } catch (err: any) {
      console.error('Failed to fetch domain data:', err)
      setError(err.message || 'Failed to load domain data')
    } finally {
      setLoading(false)
    }
  }

  // Render template based on domain data
  const renderTemplate = () => {
    if (!domain) return null

    switch (domain.template) {
      case 'minimal':
        return <MinimalTemplate domain={domain} />
      case 'modern':
        return <ModernTemplate domain={domain} />
      case 'corporate':
        return <CorporateTemplate domain={domain} />
      case 'creative':
        return <CreativeTemplate domain={domain} />
      default:
        return <MinimalTemplate domain={domain} />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !domain) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Domain Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'The domain you're looking for doesn't exist or has been removed.'}
          </p>
          <a
            href="/"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderTemplate()}
      
      {/* Chat Widget */}
      <div className="fixed bottom-6 right-6 w-full max-w-sm">
        <ChatWidget 
          domainId={domain.tokenId} 
          ownerAddress={domain.owner} 
        />
      </div>
    </div>
  )
}

// Template Components
function MinimalTemplate({ domain }: { domain: Domain }) {
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
            <img 
              src={domain.screenshot} 
              alt={`${domain.name} screenshot`}
              className="w-full max-w-3xl mx-auto rounded-lg shadow-lg"
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

          <div className="space-y-4">
            {domain.forSale && domain.price && (
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-green-700 mb-1">Buy Now Price</div>
                  <div className="text-3xl font-bold text-green-800">{domain.price} ETH</div>
                  <button className="mt-4 w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700">
                    Buy Now
                  </button>
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
              <div className="text-center">
                <div className="text-sm text-blue-700 mb-1">Interested in this domain?</div>
                <p className="text-gray-600 text-sm mb-4">
                  Connect your wallet to start a conversation with the owner
                </p>
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">
                  Connect Wallet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ModernTemplate({ domain }: { domain: Domain }) {
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
              <img 
                src={domain.screenshot} 
                alt={`${domain.name} screenshot`}
                className="relative w-full rounded-2xl shadow-2xl"
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
            {domain.forSale && domain.price ? (
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="text-center">
                  <div className="text-sm opacity-90 mb-1">Buy Now Price</div>
                  <div className="text-4xl font-bold mb-6">{domain.price} ETH</div>
                  <button className="w-full bg-white text-green-600 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                    Purchase Domain
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
                  <button className="w-full bg-white text-blue-600 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                    Contact Owner
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">Domain Features</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Blockchain Verified Ownership</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Instant Transfer</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Secure Transaction</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CorporateTemplate({ domain }: { domain: Domain }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-bold text-xl text-gray-900">DomainForge</div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
            Contact Owner
          </button>
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
            {domain.forSale && domain.price ? (
              <div className="bg-white rounded-lg shadow-sm p-6 border border-green-200">
                <h3 className="font-bold text-gray-900 mb-4">Purchase Information</h3>
                <div className="text-center mb-6">
                  <div className="text-sm text-gray-600 mb-1">Buy Now Price</div>
                  <div className="text-3xl font-bold text-green-600">{domain.price} ETH</div>
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
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">
                  Contact Owner
                </button>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Domain Benefits</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-600">Blockchain-verified ownership</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-600">Instant and secure transfer</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-600">No intermediaries required</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-600">Permanent and immutable record</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CreativeTemplate({ domain }: { domain: Domain }) {
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
            {domain.forSale && domain.price ? (
              <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 p-1 rounded-2xl">
                <div className="bg-black p-6 rounded-2xl">
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-2">Buy Now Price</div>
                    <div className="text-4xl font-bold mb-6">{domain.price} ETH</div>
                    <button className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform">
                      🚀 Claim This Masterpiece
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
                    <button className="w-full bg-white text-blue-600 py-4 rounded-xl font-bold text-lg hover:bg-gray-100">
                      Contact Owner
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white bg-opacity-10 p-6 rounded-2xl backdrop-blur-sm">
              <h3 className="font-bold text-xl mb-4">Why This Domain?</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                  <span className="text-gray-300">Blockchain-verified ownership</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  <span className="text-gray-300">Instant and secure transfer</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  <span className="text-gray-300">No intermediaries required</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  <span className="text-gray-300">Permanent record of ownership</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}