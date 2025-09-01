// src/components/landing/OwnershipHistory.tsx
'use client'

import { useEffect, useState } from 'react'
import type { OwnershipHistory } from '@/types/doma'
import { formatAddress, timeAgo } from '@/lib/utils'
import { useDoma } from '@/hooks/useDoma'

interface OwnershipHistoryProps {
  tokenId: string
}

export function OwnershipHistory({ tokenId }: OwnershipHistoryProps) {
  const [history, setHistory] = useState<OwnershipHistory[]>([])
  const [loading, setLoading] = useState(true)
  const { getOwnershipHistory } = useDoma()

  useEffect(() => {
    loadHistory()
  }, [tokenId])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const data = await getOwnershipHistory(tokenId)
      setHistory(data)
    } catch (error) {
      console.error('Failed to load ownership history:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Ownership History</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Ownership History</h3>
      
      {history.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No ownership history available</p>
      ) : (
        <div className="space-y-4">
          {history.map((event, index) => (
            <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 text-sm">
                  <span className="font-medium text-gray-900">
                    {formatAddress(event.from)} → {formatAddress(event.to)}
                  </span>
                  {event.price && (
                    <span className="text-green-600 font-medium">
                      {event.price} ETH
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                  <span>{timeAgo(event.timestamp)}</span>
                  <span>•</span>
                  <a
                    href={`https://etherscan.io/tx/${event.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    View Transaction
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
