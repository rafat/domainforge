// src/hooks/useDomainData.ts
'use client'

import { useState, useEffect } from 'react'
import { DomaDomain as Domain } from '@/types/doma'

export function useDomainData(domainId: string) {
  const [domain, setDomain] = useState<Domain | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDomainData()
  }, [domainId])

  const fetchDomainData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/domain/${domainId}`)
      if (!response.ok) throw new Error('Failed to fetch domain')
      
      const data = await response.json()
      setDomain(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const updateDomain = async (id: string, updates: Partial<Domain>) => {
    try {
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
