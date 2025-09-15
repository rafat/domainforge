// src/hooks/useDomainSync.ts
'use client'

import { useState, useCallback } from 'react'

interface SyncResult {
  success: boolean
  message: string
  error?: string
  domain?: any
}

export function useDomainSync() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null)

  const syncDomain = useCallback(async (tokenId: string) => {
    if (!tokenId) {
      const errorResult = {
        success: false,
        message: 'Token ID is required',
        error: 'No token ID provided'
      }
      setLastSyncResult(errorResult)
      return errorResult
    }

    setIsSyncing(true)
    try {
      const response = await fetch(`/api/doma/sync/${tokenId}`)
      const data: SyncResult = await response.json()
      setLastSyncResult(data)
      return data
    } catch (error) {
      const errorResult = {
        success: false,
        message: 'Failed to sync domain with blockchain',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      setLastSyncResult(errorResult)
      return errorResult
    } finally {
      setIsSyncing(false)
    }
  }, [])

  return {
    isSyncing,
    lastSyncResult,
    syncDomain
  }
}