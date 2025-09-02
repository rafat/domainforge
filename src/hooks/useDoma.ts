// src/hooks/useDoma.ts
'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { DomaService } from '@/lib/doma'
import { DomaOffer, OwnershipHistory } from '@/types/doma'

export function useDoma() {
  const { address } = useAccount()
  const [domaService] = useState(() => new DomaService())

  const getDomainInfo = async (tokenId: string, useCache: boolean = false) => {
    try {
      return await domaService.getDomainInfo(tokenId, useCache)
    } catch (error) {
      console.error('Error fetching domain info:', error)
      throw error
    }
  }

  const getDomainMetadata = async (tokenId: string, useCache: boolean = false) => {
    try {
      return await domaService.getDomainMetadata(tokenId, useCache)
    } catch (error) {
      console.error('Error fetching domain metadata:', error)
      throw error
    }
  }

  const getOffers = async (tokenId: string, useCache: boolean = false): Promise<DomaOffer[]> => {
    try {
      return await domaService.getOrderBookOffers(tokenId, useCache)
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

  const getOwnershipHistory = async (tokenId: string, useCache: boolean = false): Promise<OwnershipHistory[]> => {
    try {
      return await domaService.getOwnershipHistory(tokenId, useCache)
    } catch (error) {
      console.error('Error fetching ownership history:', error)
      return []
    }
  }

  // New methods
  const getDomainActivities = async (tokenId: string, type?: string, limit?: number, useCache: boolean = false) => {
    try {
      return await domaService.getDomainActivities(tokenId, type, limit, useCache)
    } catch (error) {
      console.error('Error fetching domain activities:', error)
      return []
    }
  }

  const getDomainsByOwner = async (ownerAddress: string, limit: number = 100, skip: number = 0, useCache: boolean = false) => {
    try {
      return await domaService.getDomainsByOwner(ownerAddress, limit, skip, useCache)
    } catch (error) {
      console.error('Error fetching domains by owner:', error)
      return []
    }
  }

  const getDomainStatistics = async (tokenId: string, useCache: boolean = false) => {
    try {
      return await domaService.getDomainStatistics(tokenId, useCache)
    } catch (error) {
      console.error('Error fetching domain statistics:', error)
      return null
    }
  }

  const getPaginatedListings = async (filters: any = {}, useCache: boolean = false) => {
    try {
      return await domaService.getPaginatedListings(filters, useCache)
    } catch (error) {
      console.error('Error fetching paginated listings:', error)
      return { items: [], totalCount: 0 }
    }
  }

  const getPaginatedOffers = async (filters: any = {}, useCache: boolean = false) => {
    try {
      return await domaService.getPaginatedOffers(filters, useCache)
    } catch (error) {
      console.error('Error fetching paginated offers:', error)
      return { items: [], totalCount: 0 }
    }
  }

  return {
    getDomainInfo,
    getDomainMetadata,
    getOffers,
    createOffer,
    getOwnershipHistory,
    getDomainActivities,
    getDomainsByOwner,
    getDomainStatistics,
    getPaginatedListings,
    getPaginatedOffers,
    isConnected: !!address
  }
}
