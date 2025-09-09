// src/hooks/useDoma.ts
'use client'

import { useAccount } from 'wagmi'
import { domaApi } from '@/lib/domaApi'
import { DomaOffer, OwnershipHistory } from '@/types/doma'

export function useDoma() {
  const { address } = useAccount()

  const getDomainInfo = async (tokenId: string) => {
    // This function likely needs to be backed by an API route
    // if it needs to fetch sensitive data or use the Doma API key.
    // For now, we assume it's a public query or the data is fetched
    // through a dedicated API route.
    // Example: return await domaApi.getDomainInfo(tokenId);
    throw new Error('getDomainInfo not implemented in the new API structure');
  }

  const getOffers = async (tokenId: string): Promise<DomaOffer[]> => {
    try {
      return await domaApi.getOffers(tokenId)
    } catch (error) {
      console.error('Error fetching offers:', error)
      return []
    }
  }

  const createOffer = async (tokenId: string, amount: string) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }
    // This needs to be backed by an API route
    // Example: return await domaApi.createOffer(tokenId, amount, address);
    throw new Error('createOffer not implemented in the new API structure');

  }

  const getOwnershipHistory = async (tokenId: string): Promise<OwnershipHistory[]> => {
    // This needs to be backed by an API route
    // Example: return await domaApi.getOwnershipHistory(tokenId);
    throw new Error('getOwnershipHistory not implemented in the new API structure');
  }

  return {
    getDomainInfo,
    getOffers,
    createOffer,
    getOwnershipHistory,
    isConnected: !!address
  }
}