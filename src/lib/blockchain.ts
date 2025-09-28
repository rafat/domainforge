// src/lib/blockchain.ts
// This file provides blockchain utility functions

import { createWalletClient, createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { domaTestnet } from './chains'

// For server-side operations, you might use a private key or wallet
// In a real implementation, this should come from environment variables
const PRIVATE_KEY = process.env.DOMA_PRIVATE_KEY as `0x${string}`

if (!PRIVATE_KEY) {
  console.warn('DOMA_PRIVATE_KEY is not set. Blockchain write operations will fail.')
}

let walletClientInstance: any = null
let publicClientInstance: any = null

export async function getWalletClient() {
  if (walletClientInstance) {
    return walletClientInstance
  }

  if (!PRIVATE_KEY) {
    throw new Error('DOMA_PRIVATE_KEY is not set')
  }

  const account = privateKeyToAccount(PRIVATE_KEY)
  
  walletClientInstance = createWalletClient({
    account,
    chain: domaTestnet,
    transport: http(),
  })

  return walletClientInstance
}

export async function getPublicClient() {
  if (publicClientInstance) {
    return publicClientInstance
  }

  publicClientInstance = createPublicClient({
    chain: domaTestnet,
    transport: http(),
  })

  return publicClientInstance
}