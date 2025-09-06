// src/app/builder/new/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useWallet } from '@/hooks/useWallet'
import { PageEditor } from '@/components/builder/PageEditor'
import LoadingSpinner from '@/components/LoadingSpinner'
import { DomaDomain } from '@/types/doma'

export default function NewBuilderPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { address, isConnected } = useWallet()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [domain, setDomain] = useState<DomaDomain | null>(null)

  const tokenId = searchParams.get('tokenId')
  const domainName = searchParams.get('domainName')

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
      return
    }
    
    if (!tokenId || !domainName) {
      setError('Missing required parameters')
      setLoading(false)
      return
    }

    // Create a temporary domain object for the builder
    const tempDomain: DomaDomain = {
      id: `temp-${tokenId}`,
      name: domainName,
      tokenId: tokenId,
      owner: address || '',
      contractAddress: '',
      chainId: 97476, // Doma testnet
      registrationDate: new Date(),
      expiry: null,
      title: null,
      description: null,
      template: 'minimal',
      customCSS: null,
      isActive: false,
      screenshot: null,
      metaTitle: null,
      metaDescription: null,
      buyNowPrice: null,
      acceptOffers: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      forSale: false,
      price: null,
      records: [],
      offers: []
    }

    setDomain(tempDomain)
    setLoading(false)
  }, [isConnected, tokenId, domainName, address, router])

  const handleSave = async (domainData: any) => {
    try {
      // Check if this is a temporary domain (starts with "temp-")
      const isTempDomain = domain?.id.startsWith('temp-');
      
      let response;
      
      if (isTempDomain) {
        // For temporary domains, we need to either create or update
        // First, check if a domain with this name already exists
        const checkResponse = await fetch(`/api/domains?name=${encodeURIComponent(domainName || '')}`);
        
        if (checkResponse.ok) {
          const checkData = await checkResponse.json();
          const existingDomain = checkData.domains?.find((d: any) => d.name === domainName);
          
          if (existingDomain) {
            // Update existing domain
            response = await fetch(`/api/domain/${existingDomain.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...domainData
              }),
            });
          } else {
            // Create new domain
            response = await fetch('/api/domains', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: domainName,
                tokenId: tokenId,
                owner: address,
                ...domainData
              }),
            });
          }
        } else {
          // Fallback to creating new domain
          response = await fetch('/api/domains', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: domainName,
              tokenId: tokenId,
              owner: address,
              ...domainData
            }),
          });
        }
      } else {
        // For existing domains, update the record
        response = await fetch(`/api/domain/${domain?.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...domainData
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save domain');
      }

      const result = await response.json();
      // Redirect to the edit page for the newly created/updated domain
      router.push(`/builder/${result.id || result.domain.id}`);
    } catch (err: any) {
      console.error('Failed to save domain:', err);
      setError(err.message || 'Failed to save domain');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/my-domains')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to My Domains
          </button>
        </div>
      </div>
    )
  }

  if (!domain) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Domain Not Found</h1>
          <button
            onClick={() => router.push('/my-domains')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to My Domains
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/my-domains')}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to My Domains
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Create Landing Page</h1>
          <p className="text-gray-600">Creating a page for {domain.name}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <PageEditor 
            domainId={domain.id} 
            initialDomain={domain}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  )
}