// src/components/ConnectWalletButton.tsx
'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { useConnect, useDisconnect } from 'wagmi'
import { formatAddress } from '@/lib/utils'

export default function ConnectWalletButton() {
  const { isConnected, address, isWrongNetwork } = useWallet()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [isHovered, setIsHovered] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Fix hydration error by only rendering after component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleConnect = () => {
    const connector = connectors[0] // Use first available connector
    if (connector) {
      connect({ connector })
    }
  }

  const handleDisconnect = () => {
    disconnect()
  }

  // Don't render anything until component is mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors opacity-50 cursor-not-allowed"
        disabled
      >
        Connect Wallet
      </button>
    )
  }

  if (isWrongNetwork) {
    return (
      <button
        onClick={handleConnect}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        Wrong Network
      </button>
    )
  }

  if (isConnected && address) {
    return (
      <div 
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>{formatAddress(address)}</span>
        </button>
        
        {isHovered && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10">
            <div className="text-sm text-gray-600 mb-2">Connected Wallet</div>
            <div className="font-mono text-xs break-all">{address}</div>
            <button 
              onClick={handleDisconnect}
              className="mt-3 w-full text-left text-sm text-red-600 hover:text-red-800"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
    >
      Connect Wallet
    </button>
  )
}