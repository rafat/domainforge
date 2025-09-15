// src/hooks/useDomaSync.ts
'use client'

import { useState, useCallback } from 'react'

interface SyncResult {
  success: boolean
  message: string
  skipped?: boolean
  error?: string
}

export function useDomaSync() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null)

  const triggerSync = useCallback(async (force: boolean = false) => {
    setIsSyncing(true)
    try {
      const response = await fetch(`/api/doma/sync${force ? '?force=true' : ''}`)
      const data: SyncResult = await response.json()
      setLastSyncResult(data)
      return data
    } catch (error) {
      const errorResult = {
        success: false,
        message: 'Failed to sync with blockchain',
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
    triggerSync
  }
}