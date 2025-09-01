// src/hooks/useDomaBlockchainDomains.ts
'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/hooks/useWallet'

// Doma GraphQL types based on the API documentation
interface DomaTokenModel {
  tokenId: string
  networkId: string
  ownerAddress: string
  type: 'OWNERSHIP' | 'SYNTHETIC'
  startsAt?: string
  expiresAt: string
  explorerUrl: string
  tokenAddress: string
  createdAt: string
  chain: {
    name: string
    networkId: string
  }
}

interface DomaNameModel {
  name: string
  expiresAt: string
  tokenizedAt: string
  eoi: boolean
  registrar: {
    name: string
    ianaId: string
    websiteUrl?: string
    supportEmail?: string
  }
  nameservers: Array<{
    ldhName: string
  }>
  dsKeys: Array<{
    keyTag: number
    algorithm: number
    digest: string
    digestType: number
  }>
  transferLock?: boolean
  claimedBy?: string
  tokens: DomaTokenModel[]
}

interface DomaPaginatedNamesResponse {
  items: DomaNameModel[]
  totalCount: number
  pageSize: number
  currentPage: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

interface DomaGraphQLResponse {
  data: {
    names: DomaPaginatedNamesResponse
  }
  errors?: Array<{
    message: string
    locations?: Array<{
      line: number
      column: number
    }>
    path?: string[]
  }>
}

// Convert wallet address to CAIP-10 format for Ethereum chains
function formatAddressForCAIP10(address: string, chainId: number = 1): string {
  // CAIP-10 format: namespace:reference:address
  // For Ethereum mainnet: eip155:1:0x...
  // For other EVM chains: eip155:chainId:0x...
  return `eip155:${chainId}:${address.toLowerCase()}`
}

export function useDomaBlockchainDomains(debugAddress?: string) {
  const { address, isConnected, chainId } = useWallet()
  const [domains, setDomains] = useState<DomaNameModel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const effectiveAddress = debugAddress || address
  const effectiveIsConnected = debugAddress ? true : isConnected

  useEffect(() => {
    if (effectiveIsConnected && effectiveAddress) {
      fetchDomainsFromBlockchain()
    } else {
      setDomains([])
      setError(null)
    }
  }, [effectiveAddress, effectiveIsConnected, chainId])

  const fetchDomainsFromBlockchain = async () => {
    if (!effectiveAddress) {
      setError('No wallet address available')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Convert address to CAIP-10 format
      const caip10Address = formatAddressForCAIP10(effectiveAddress, chainId || 1)

      // GraphQL query to fetch names owned by the address
      const query = `
        query GetNamesByOwner($ownedBy: [AddressCAIP10!]!, $take: Int!, $skip: Int!) {
          names(
            ownedBy: $ownedBy
            take: $take
            skip: $skip
            claimStatus: ALL
            sortOrder: DESC
          ) {
            items {
              name
              expiresAt
              tokenizedAt
              eoi
              registrar {
                name
                ianaId
                websiteUrl
                supportEmail
              }
              nameservers {
                ldhName
              }
              dsKeys {
                keyTag
                algorithm
                digest
                digestType
              }
              transferLock
              claimedBy
              tokens {
                tokenId
                networkId
                ownerAddress
                type
                startsAt
                expiresAt
                explorerUrl
                tokenAddress
                createdAt
                chain {
                  name
                  networkId
                }
              }
            }
            totalCount
            pageSize
            currentPage
            totalPages
            hasPreviousPage
            hasNextPage
          }
        }
      `

      const variables = {
        ownedBy: [caip10Address],
        take: 50,
        skip: 0
      }

      console.log('Fetching domains from Doma API with:', { caip10Address, variables })

      const response = await fetch('/api/doma/domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result: DomaGraphQLResponse = await response.json()

      if (result.errors && result.errors.length > 0) {
        throw new Error(`GraphQL error: ${result.errors[0].message}`)
      }

      console.log('Doma API response:', result.data?.names)
      setDomains(result.data?.names?.items || [])
    } catch (err) {
      console.error('Failed to fetch domains from Doma API:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    if (effectiveIsConnected && effectiveAddress) {
      fetchDomainsFromBlockchain()
    }
  }

  return {
    domains,
    loading,
    error,
    refetch,
    isConnected: effectiveIsConnected,
    address: effectiveAddress
  }
}