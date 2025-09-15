
// src/app/landing/[domainName]/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useWallet } from '@/hooks/useWallet'
import LoadingSpinner from '@/components/LoadingSpinner'
import { DomaDomain as Domain } from '@/types/doma'
import { SupabaseChat } from '@/components/landing/SupabaseChat'

import { 
  MinimalTemplate, 
  ModernTemplate, 
  CorporateTemplate, 
  CreativeTemplate, 
  ElegantTemplate, 
  TechTemplate, 
  CustomizationProps
} from '@/components/landing/templates'

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

  // Sync domain with blockchain when page loads
  const syncDomainWithBlockchain = useCallback(async (tokenId: string) => {
    try {
      // Trigger synchronization with blockchain
      await fetch(`/api/doma/sync/${tokenId}`)
    } catch (error) {
      console.error('Failed to sync domain with blockchain:', error)
    }
  }, [])

  useEffect(() => {
    if (domainName) {
      fetchDomainData()
    }
  }, [domainName, fetchDomainData])

  // Trigger blockchain sync when domain data is loaded
  useEffect(() => {
    if (domain && domain.tokenId) {
      syncDomainWithBlockchain(domain.tokenId)
    }
  }, [domain, syncDomainWithBlockchain])

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
