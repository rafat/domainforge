// src/contexts/WalletContext.tsx
'use client'

import React, { createContext, useContext, ReactNode, useMemo } from 'react'
import { useAccount, useChainId, useBalance, useEnsName } from 'wagmi'
import { domaTestnet } from '@/lib/chains'

interface WalletContextType {
  address: `0x${string}` | undefined
  isConnected: boolean
  chainId: number | undefined
  ensName: string | undefined
  balance: string | undefined
  isWrongNetwork: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { data: ensName } = useEnsName({ address })
  const { data: balance } = useBalance({ address })
  
  const contextValue = useMemo(() => {
    const isWrongNetwork = isConnected && chainId !== domaTestnet.id
    
    return {
      address,
      isConnected,
      chainId,
      ensName: ensName || undefined,
      balance: balance?.formatted,
      isWrongNetwork
    }
  }, [address, isConnected, chainId, ensName, balance])
  
  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}