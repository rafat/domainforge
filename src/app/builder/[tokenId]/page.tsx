// src/app/builder/[domainId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useWallet } from '@/hooks/useWallet'
import { PageEditor } from '@/components/builder/PageEditor'
import LoadingSpinner from '@/components/LoadingSpinner'
import { DomaDomain } from '@/types/doma'

export default function BuilderPage() {
  const { tokenId } = useParams()
  const router = useRouter()
  const { address, isConnected } = useWallet()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [domain, setDomain] = useState<DomaDomain | null>(null)

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
      return
    }
    
    // Check if user owns this domain
    checkDomainOwnership()
  }, [isConnected, tokenId])

  const checkDomainOwnership = async () => {
    if (!tokenId || !address) return

    try {
      setLoading(true)
      const response = await fetch(`/api/domains/${tokenId}`)
      
      if (!response.ok) {
        throw new Error('Domain not found')
      }
      
      const { domain } = await response.json()
      
      // Check if user owns this domain
      if (domain.owner.toLowerCase() !== address.toLowerCase()) {
        setError('You do not own this domain')
        return
      }
      
      setDomain(domain)
    } catch (err: any) {
      console.error('Error checking domain ownership:', err)
      setError(err.message || 'Failed to load domain')
    } finally {
      setLoading(false)
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/profile')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Profile
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
            onClick={() => router.push('/profile?tab=builder')}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Page Builder
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Landing Page Builder</h1>
          <p className="text-gray-600">Create a custom landing page for your domain</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <PageEditor initialDomain={domain || undefined} />
        </div>
      </div>
    </div>
  )
}