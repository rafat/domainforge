// src/hooks/useDoma.ts
'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { DomaService } from '@/lib/doma'
import { DomaOffer, OwnershipHistory } from '@/types/doma'

export function useDoma() {
  const { address } = useAccount()
  const [domaService] = useState(() => new DomaService())

  const getDomainInfo = async (tokenId: string) => {
    try {
      return await domaService.getDomainInfo(tokenId)
    } catch (error) {
      console.error('Error fetching domain info:', error)
      throw error
    }
  }

  const getDomainMetadata = async (tokenId: string) => {
    try {
      return await domaService.getDomainMetadata(tokenId)
    } catch (error) {
      console.error('Error fetching domain metadata:', error)
      throw error
    }
  }

  const getOffers = async (tokenId: string): Promise<DomaOffer[]> => {
    try {
      return await domaService.getOrderBookOffers(tokenId)
    } catch (error) {
      console.error('Error fetching offers:', error)
      return []
    }
  }

  const createOffer = async (tokenId: string, amount: string) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    try {
      // In API-first approach, we would use Doma's Orderbook API
      // For now, this is a placeholder that would need actual implementation
      throw new Error('Offer creation via API not yet implemented')
    } catch (error) {
      console.error('Error creating offer:', error)
      throw error
    }
  }

  const getOwnershipHistory = async (tokenId: string): Promise<OwnershipHistory[]> => {
    try {
      return await domaService.getOwnershipHistory(tokenId)
    } catch (error) {
      console.error('Error fetching ownership history:', error)
      return []
    }
  }

  return {
    getDomainInfo,
    getDomainMetadata,
    getOffers,
    createOffer,
    getOwnershipHistory,
    isConnected: !!address
  }
}
