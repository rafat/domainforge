// src/app/test-sanity/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWalletClient } from 'wagmi'

export default function SanityTestPage() {
  const { address, isConnected } = useAccount()
  const { data: walletClient, isLoading, error } = useWalletClient()
  const [mounted, setMounted] = useState(false)
  const [status, setStatus] = useState('Idle')
  const [walletClientInfo, setWalletClientInfo] = useState<string | null>(null)

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    if (isConnected && address) {
      if (isLoading) {
        setStatus('Loading wallet client...')
        return
      }

      if (error) {
        setStatus(`Error loading wallet client: ${error.message}`)
        console.error('Wallet client error:', error)
        return
      }

      if (walletClient) {
        const info = `Success! Chain: ${walletClient.chain.name} (ID: ${walletClient.chain.id}), Account: ${walletClient.account.address}`
        setWalletClientInfo(info)
        setStatus('Success!')
      } else {
        setStatus('No wallet client available')
      }
    } else {
      setStatus('Wallet not connected')
      setWalletClientInfo(null)
    }
  }, [mounted, isConnected, address, walletClient, isLoading, error])

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
        <h1>Wagmi Sanity Check</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Wagmi Sanity Check</h1>
      <p>
        <strong>Wallet Connected:</strong> {isConnected ? 'Yes' : 'No'}
      </p>
      <p>
        <strong>Address:</strong> {address || 'N/A'}
      </p>
      <hr />
      <p>
        <strong>Status:</strong> {status}
      </p>
      {walletClientInfo && (
        <p style={{ color: 'green', wordBreak: 'break-all' }}>
          <strong>Client Info:</strong> {walletClientInfo}
        </p>
      )}
      {status.startsWith('Error') && (
        <p style={{ color: 'red' }}>
          There is a fundamental issue with your wagmi setup. The error happened when
          loading the wallet client.
        </p>
      )}
    </div>
  )
}