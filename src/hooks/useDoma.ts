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

  const createOffer = async (tokenId: string, amount: string, currency: string = 'ETH') => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    try {
      // Create offer using Doma's Orderbook API
      const response = await domaService.createOffer(tokenId, amount, currency)
      return response
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

  // New method to get paginated offers
  const getPaginatedOffers = async (filters: any = {}, useCache: boolean = false) {
    try {
      return await domaService.getPaginatedOffers(filters, useCache)
    } catch (error) {
      console.error('Error fetching paginated offers:', error)
      return { items: [], totalCount: 0 }
    }
  }
  
  // New methods to check offer status
  const isOfferActive = async (offerId: string, tokenId: string, useCache: boolean = false) => {
    try {
      return await domaService.isOfferActive(offerId, tokenId, useCache)
    } catch (error) {
      console.error('Error checking offer status:', error)
      return false
    }
  }
  
  const isOfferExpired = async (offerId: string, tokenId: string, useCache: boolean = false) => {
    try {
      return await domaService.isOfferExpired(offerId, tokenId, useCache)
    } catch (error) {
      console.error('Error checking offer expiration:', error)
      return false
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
    isOfferActive,
    isOfferExpired,
    isConnected: !!address
  }
}
