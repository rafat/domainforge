// src/hooks/useDomainData.ts
'use client'

import { useState, useEffect } from 'react'
import { DomaDomain as Domain } from '@/types/doma'

export function useDomainData(domainId: string, initialDomain?: Domain) {
  const [domain, setDomain] = useState<Domain | null>(initialDomain || null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If this is a temporary domain (starts with "temp-"), don't fetch from API
    if (domainId && domainId.startsWith('temp-')) {
      // Use initialDomain if provided, otherwise keep the existing domain state
      if (initialDomain) {
        setDomain(initialDomain)
      }
      setLoading(false)
      return
    }
    
    // Only fetch if we have a valid domainId
    if (domainId) {
      fetchDomainData()
    }
  }, [domainId, initialDomain])

  const fetchDomainData = async () => {
    try {
      setLoading(true)
      // Use the tokenId endpoint to fetch domain data
      const response = await fetch(`/api/domains/${domainId}`)
      if (!response.ok) throw new Error('Failed to fetch domain')
      
      const data = await response.json()
      setDomain(data.domain)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const updateDomain = async (id: string, updates: Partial<Domain>) => {
    try {
      // Use the tokenId endpoint since that's what's being passed from PageEditor
      const response = await fetch(`/api/domains/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) throw new Error('Failed to update domain')
      
      const updatedDomain = await response.json()
      setDomain(updatedDomain.domain)
      return updatedDomain.domain
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Update failed')
    }
  }

  return {
    domain,
    loading,
    error,
    updateDomain,
    refetch: fetchDomainData
  }
}
