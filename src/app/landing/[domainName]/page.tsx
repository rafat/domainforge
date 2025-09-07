// src/app/landing/[domainName]/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useWallet } from '@/hooks/useWallet'
import LoadingSpinner from '@/components/LoadingSpinner'
import { DomaDomain as Domain } from '@/types/doma'
import { SupabaseChat } from '@/components/landing/SupabaseChat'

type CustomizationProps = {
  primaryColor?: string,
  secondaryColor?: string,
  accentColor?: string,
  backgroundColor?: string,
  cardBackgroundColor?: string,
  fontFamily?: string,
  borderRadius?: string,
  buttonStyle?: string,
  layoutSpacing?: string,
  textAlign?: string
} | null;

interface TemplateProps {
  domain: Domain;
  customization: CustomizationProps;
}

export default function LandingPage() {
  const { domainName } = useParams()
  const { isConnected } = useWallet()
  const [domain, setDomain] = useState<Domain | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDomainData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // First try to get from our database using domain name (exact match)
      const dbResponse = await fetch(`/api/domains?name=${domainName}`)
      console.log('API Response Status:', dbResponse.status);
      if (dbResponse.ok) {
        const dbData = await dbResponse.json()
        console.log('API Response Data:', dbData);
        if (dbData.domains && dbData.domains.length > 0) {
          console.log('Domain Data:', dbData.domains[0]);
          setDomain(dbData.domains[0])
          return
        }
      }
      
      // If not in database, we can't display the page
      setError('Domain not found')
    } catch (err: unknown) {
      console.error('Failed to fetch domain data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load domain data')
    } finally {
      setLoading(false)
    }
  }, [domainName])

  useEffect(() => {
    if (domainName) {
      fetchDomainData()
    }
  }, [domainName, fetchDomainData])

  // Render template based on domain data
  const renderDomainTemplate = () => {
    if (!domain) return null;

    // We still parse the customization data from the domain object
    let customization: CustomizationProps = null;
    if (domain.customCSS) {
      try {
        customization = JSON.parse(domain.customCSS);
      } catch (e: unknown) {
        console.warn('Failed to parse customization data');
      }
    }

    // Now, we *always* render a React component, just passing the customization object along.
    switch (domain.template) {
      case 'minimal':
        return <MinimalTemplate domain={domain} customization={customization} />;
      case 'modern':
        return <ModernTemplate domain={domain} customization={customization} />;
      case 'corporate':
        return <CorporateTemplate domain={domain} customization={customization} />;
      case 'creative':
        return <CreativeTemplate domain={domain} customization={customization} />;
      case 'elegant':
        return <ElegantTemplate domain={domain} customization={customization} />;
      case 'tech':
        return <TechTemplate domain={domain} customization={customization} />;
      default:
        return <MinimalTemplate domain={domain} customization={customization} />;
    }
  };

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
            {error || "The domain you're looking for doesn't exist or has been removed."}
          </p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderDomainTemplate()}
    </div>
  )
}

// Template Components
function MinimalTemplate({ domain, customization }: TemplateProps)  {
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

function ModernTemplate({ domain, customization }: TemplateProps)  {
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

function CorporateTemplate({ domain, customization }: TemplateProps) {
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

function CreativeTemplate({ domain, customization }: TemplateProps)  {
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
              it&#39;s ready to power your next big project.
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

function ElegantTemplate({ domain, customization }: TemplateProps) {
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
              With its verified ownership and premium status, it&#39;s perfectly suited for luxury brands 
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
            {domain.forSale && domain.price ? (
              <div className="bg-gradient-to-br from-amber-400 to-rose-500 rounded-2xl shadow-lg p-1">
                <div className="bg-white p-6 rounded-2xl">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Buy Now Price</div>
                    <div className="text-4xl font-serif font-light text-gray-900 mb-6">{domain.price} ETH</div>
                    <button className="w-full bg-gradient-to-r from-amber-500 to-rose-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
                      Acquire Domain
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

function TechTemplate({ domain, customization }: TemplateProps)  {
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
            {domain.forSale && domain.price ? (
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-1 shadow-xl">
                <div className="bg-gray-900 p-6 rounded-2xl">
                  <div className="text-center">
                    <div className="text-sm text-cyan-300 mb-1">Buy Now Price</div>
                    <div className="text-4xl font-mono font-bold mb-6">{domain.price} ETH</div>
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