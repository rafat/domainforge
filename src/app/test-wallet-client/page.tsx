// src/app/test-wallet-client/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import { getWalletClient } from '@wagmi/core'
import { wagmiConfig } from '@/components/Web3ModalProvider'

export default function WalletClientTestPage() {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  
  const [manualWalletClient, setManualWalletClient] = useState<any>(null)
  const [status, setStatus] = useState('Initializing...')

  useEffect(() => {
    console.log('=== Wallet Client Test ===')
    console.log('Address:', address)
    console.log('Is connected:', isConnected)
    console.log('Wallet client from hook:', walletClient)
    console.log('Public client:', publicClient)
    console.log('=========================')
    
    if (isConnected && !walletClient) {
      setStatus('Wallet connected but wallet client not available')
    } else if (isConnected && walletClient) {
      setStatus('Wallet and wallet client both available')
    } else {
      setStatus('Wallet not connected')
    }
  }, [address, isConnected, walletClient, publicClient])

  const handleManualGetWalletClient = async () => {
    try {
      setStatus('Getting wallet client manually...')
      console.log('Getting wallet client manually...')
      const client = await getWalletClient(wagmiConfig)
      console.log('Manual wallet client:', client)
      setManualWalletClient(client)
      setStatus('Manual wallet client retrieved')
    } catch (error) {
      console.error('Failed to get wallet client manually:', error)
      setStatus('Failed to get wallet client manually: ' + (error as Error).message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Wallet Client Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Wallet Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <div className="text-sm text-gray-500">Address</div>
                <div className="font-mono text-sm truncate">{address || 'Not connected'}</div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-sm text-gray-500">Connected</div>
                <div className={isConnected ? 'text-green-600' : 'text-red-600'}>
                  {isConnected ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Client Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <div className="text-sm text-gray-500">Hook Wallet Client</div>
                <div className={walletClient ? 'text-green-600' : 'text-red-600'}>
                  {walletClient ? 'Available' : 'Not available'}
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-sm text-gray-500">Public Client</div>
                <div className={publicClient ? 'text-green-600' : 'text-red-600'}>
                  {publicClient ? 'Available' : 'Not available'}
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-sm text-gray-500">Manual Wallet Client</div>
                <div className={manualWalletClient ? 'text-green-600' : 'text-red-600'}>
                  {manualWalletClient ? 'Available' : 'Not available'}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Status</h2>
            <div className="border rounded-lg p-4">
              <div className="text-gray-700">{status}</div>
            </div>
          </div>
          
          <div>
            <button
              onClick={handleManualGetWalletClient}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
            >
              Get Wallet Client Manually
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}