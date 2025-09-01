// src/hooks/useUserDomains.ts
'use client'

import { useState, useEffect } from 'react'
import { DomaDomain as Domain } from '@/types/doma'
import { useWallet } from '@/hooks/useWallet'

export function useUserDomains(debugAddress?: string) {
  const { address, isConnected } = useWallet()
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use debug address if provided, otherwise use wallet address
  const effectiveAddress = debugAddress || address
  const effectiveIsConnected = debugAddress ? true : isConnected

  useEffect(() => {
    if (effectiveIsConnected && effectiveAddress) {
      fetchUserDomains()
    } else {
      setDomains([])
    }
  }, [effectiveAddress, effectiveIsConnected])

  const fetchUserDomains = async () => {
    if (!effectiveAddress) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/domains?owner=${effectiveAddress}&limit=50`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch domains')
      }
      
      const data = await response.json()
      setDomains(data.domains || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setDomains([])
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    if (effectiveIsConnected && effectiveAddress) {
      fetchUserDomains()
    }
  }

  return {
    domains,
    loading,
    error,
    refetch,
    hasWallet: effectiveIsConnected,
    walletAddress: effectiveAddress
  }
}