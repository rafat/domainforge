// src/lib/domaApi.ts
// Dedicated client for Doma Protocol APIs
import { 
  PollEventsResponse, 
  AcknowledgeEventResponse, 
  ResetPollingResponse,
  DomaEventType
} from '@/types/domaEvents'
import { domaCache } from './cache'

// Get API endpoints from environment variables
const DOMA_SUBGRAPH_URL = process.env.NEXT_PUBLIC_DOMA_SUBGRAPH_URL || 'https://api-testnet.doma.xyz/graphql'
const DOMA_API_URL = process.env.NEXT_PUBLIC_DOMA_API_URL || 'https://api-testnet.doma.xyz'
const DOMA_API_KEY = process.env.DOMA_API_KEY || 'v1.xxxx';

export class DomaApiClient {
  private subgraphUrl: string
  private apiUrl: string
  private apiKey: string
  
  constructor() {
    this.subgraphUrl = DOMA_SUBGRAPH_URL
    this.apiUrl = DOMA_API_URL
    this.apiKey = DOMA_API_KEY
  }
  
  private async graphqlRequest(query: string, variables: any = {}, useCache: boolean = false, cacheKey?: string) {
    // Generate cache key if not provided
    const key = cacheKey || `graphql_${JSON.stringify({ query, variables })}`;
    
    // Check cache first if enabled
    if (useCache) {
      const cached = domaCache.get(key);
      if (cached) {
        console.log(`Cache hit for key: ${key}`);
        return cached;
      }
    }
    
    const response = await fetch(this.subgraphUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': this.apiKey,
      },
      body: JSON.stringify({
        query,
        variables
      })
    })
    
    if (!response.ok) {
      throw new Error(`Subgraph API error: ${response.statusText}`)
    }
    
    const result = await response.json()
    
    if (result.errors) {
      throw new Error(`GraphQL error: ${JSON.stringify(result.errors)}`)
    }
    
    // Cache the result if caching is enabled
    if (useCache) {
      domaCache.set(key, result.data);
    }
    
    return result.data
  }
  
  private async restRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.apiUrl}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Api-Key': this.apiKey
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }
    
    return await response.json()
  }
  
  // Domain/Token queries
  async getToken(tokenId: string, useCache: boolean = false) {
    const query = `
      query GetToken($tokenId: String!) {
        token(tokenId: $tokenId) {
          tokenId
          ownerAddress
          name {
            name
            expiresAt
            registrar {
              ianaId
              name
              websiteUrl
              supportEmail
            }
          }
          chain {
            networkId
            name
          }
          createdAt
          expiresAt
          type
          tokenAddress
          explorerUrl
          listings {
            id
            externalId
            price
            offererAddress
            orderbook
            currency {
              name
              symbol
              decimals
            }
            expiresAt
            createdAt
            updatedAt
          }
          activities {
            ... on TokenMintedActivity {
              type
              tokenId
              createdAt
              owner: to
              txHash
              finalized
            }
            ... on TokenTransferredActivity {
              type
              tokenId
              createdAt
              transferredFrom
              transferredTo
              txHash
              finalized
            }
            ... on TokenListedActivity {
              type
              tokenId
              createdAt
              orderId
              startsAt
              expiresAt
              seller
              buyer
              payment {
                price
                tokenAddress
                currencySymbol
              }
              orderbook
              txHash
              finalized
            }
            ... on TokenOfferReceivedActivity {
              type
              tokenId
              createdAt
              orderId
              expiresAt
              buyer
              seller
              payment {
                price
                tokenAddress
                currencySymbol
              }
              orderbook
              txHash
              finalized
            }
            ... on TokenListingCancelledActivity {
              type
              tokenId
              createdAt
              orderId
              reason
              orderbook
              txHash
              finalized
            }
            ... on TokenOfferCancelledActivity {
              type
              tokenId
              createdAt
              orderId
              reason
              orderbook
              txHash
              finalized
            }
            ... on TokenPurchasedActivity {
              type
              tokenId
              createdAt
              orderId
              purchasedAt
              seller
              buyer
              payment {
                price
                tokenAddress
                currencySymbol
              }
              orderbook
              txHash
              finalized
            }
          }
        }
      }
    `
    
    const cacheKey = `token_${tokenId}`;
    const data = await this.graphqlRequest(query, { tokenId }, useCache, cacheKey)
    return data.token
  }
  
  async getOffers(tokenId: string, status: string = 'ACTIVE', useCache: boolean = false) {
    const query = `
      query GetOffers($tokenId: String!, $status: OfferStatus) {
        offers(tokenId: $tokenId, status: $status, sortOrder: DESC) {
          items {
            id
            externalId
            price
            offererAddress
            orderbook
            currency {
              name
              symbol
              decimals
            }
            expiresAt
            createdAt
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
    
    const cacheKey = `offers_${tokenId}_${status}`;
    const data = await this.graphqlRequest(query, { tokenId, status }, useCache, cacheKey)
    return data.offers || { items: [], totalCount: 0 }
  }
  
  async getListings(tokenId: string, status: string = 'ACTIVE', useCache: boolean = false) {
    const query = `
      query GetListings($tokenId: String!, $status: OfferStatus) {
        listings(tokenId: $tokenId, status: $status, sortOrder: DESC) {
          items {
            id
            externalId
            price
            offererAddress
            orderbook
            currency {
              name
              symbol
              decimals
            }
            expiresAt
            createdAt
            updatedAt
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
    
    const cacheKey = `listings_${tokenId}_${status}`;
    const data = await this.graphqlRequest(query, { tokenId, status }, useCache, cacheKey)
    return data.listings || { items: [], totalCount: 0 }
  }
  
  async getNames(filters: any = {}, useCache: boolean = false) {
    const query = `
      query GetNames($ownedBy: [AddressCAIP10!], $name: String, $tlds: [String!], $skip: Int, $take: Int, $claimStatus: NamesQueryClaimStatus, $networkIds: [String!], $registrarIanaIds: [Int!], $sortOrder: SortOrderType) {
        names(ownedBy: $ownedBy, name: $name, tlds: $tlds, skip: $skip, take: $take, claimStatus: $claimStatus, networkIds: $networkIds, registrarIanaIds: $registrarIanaIds, sortOrder: $sortOrder) {
          items {
            name
            expiresAt
            tokenizedAt
            eoi
            registrar {
              ianaId
              name
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
              listings {
                id
                externalId
                price
                offererAddress
                orderbook
                currency {
                  name
                  symbol
                  decimals
                }
                expiresAt
                createdAt
                updatedAt
              }
              activities {
                ... on TokenMintedActivity {
                  type
                  tokenId
                  createdAt
                  owner: to
                  txHash
                  finalized
                }
                ... on TokenTransferredActivity {
                  type
                  tokenId
                  createdAt
                  transferredFrom
                  transferredTo
                  txHash
                  finalized
                }
                ... on TokenListedActivity {
                  type
                  tokenId
                  createdAt
                  orderId
                  startsAt
                  expiresAt
                  seller
                  buyer
                  payment {
                    price
                    tokenAddress
                    currencySymbol
                  }
                  orderbook
                  txHash
                  finalized
                }
                ... on TokenOfferReceivedActivity {
                  type
                  tokenId
                  createdAt
                  orderId
                  expiresAt
                  buyer
                  seller
                  payment {
                    price
                    tokenAddress
                    currencySymbol
                  }
                  orderbook
                  txHash
                  finalized
                }
                ... on TokenListingCancelledActivity {
                  type
                  tokenId
                  createdAt
                  orderId
                  reason
                  orderbook
                  txHash
                  finalized
                }
                ... on TokenOfferCancelledActivity {
                  type
                  tokenId
                  createdAt
                  orderId
                  reason
                  orderbook
                  txHash
                  finalized
                }
                ... on TokenPurchasedActivity {
                  type
                  tokenId
                  createdAt
                  orderId
                  purchasedAt
                  seller
                  buyer
                  payment {
                    price
                    tokenAddress
                    currencySymbol
                  }
                  orderbook
                  txHash
                  finalized
                }
              }
            }
            activities {
              ... on NameClaimedActivity {
                type
                txHash
                sld
                tld
                createdAt
                claimedBy
              }
              ... on NameRenewedActivity {
                type
                txHash
                sld
                tld
                createdAt
                expiresAt
              }
              ... on NameDetokenizedActivity {
                type
                txHash
                sld
                tld
                createdAt
                networkId
              }
              ... on NameTokenizedActivity {
                type
                txHash
                sld
                tld
                createdAt
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
    
    const cacheKey = `names_${JSON.stringify(filters)}`;
    const data = await this.graphqlRequest(query, filters, useCache, cacheKey)
    return data.names || { items: [], totalCount: 0 }
  }
  
  // Orderbook API methods
  async createOffer(offerData: {
    orderbook: string;
    chainId: string;
    parameters: any;
  }) {
    try {
      return await this.restRequest('/v1/orderbook/offer', {
        method: 'POST',
        body: JSON.stringify(offerData)
      })
    } catch (error: any) {
      throw new Error(`Failed to create offer: ${error.message}`)
    }
  }
  
  async createListing(listingData: {
    orderbook: string;
    chainId: string;
    parameters: any;
  }) {
    try {
      return await this.restRequest('/v1/orderbook/list', {
        method: 'POST',
        body: JSON.stringify(listingData)
      })
    } catch (error: any) {
      throw new Error(`Failed to create listing: ${error.message}`)
    }
  }
  
  async cancelOffer(orderId: string, signature: string) {
    try {
      return await this.restRequest('/v1/orderbook/offer/cancel', {
        method: 'POST',
        body: JSON.stringify({ orderId, signature })
      })
    } catch (error: any) {
      throw new Error(`Failed to cancel offer: ${error.message}`)
    }
  }
  
  async cancelListing(orderId: string, signature: string) {
    try {
      return await this.restRequest('/v1/orderbook/listing/cancel', {
        method: 'POST',
        body: JSON.stringify({ orderId, signature })
      })
    } catch (error: any) {
      throw new Error(`Failed to cancel listing: ${error.message}`)
    }
  }
  
  async getOfferFulfillmentData(orderId: string, fulfiller: string) {
    try {
      return await this.restRequest(`/v1/orderbook/offer/${orderId}/${fulfiller}`)
    } catch (error: any) {
      throw new Error(`Failed to get offer fulfillment data: ${error.message}`)
    }
  }
  
  async getListingFulfillmentData(orderId: string, buyer: string) {
    try {
      return await this.restRequest(`/v1/orderbook/listing/${orderId}/${buyer}`)
    } catch (error: any) {
      throw new Error(`Failed to get listing fulfillment data: ${error.message}`)
    }
  }
  
  async getOrderbookFees(orderbook: string, chainId: string, contractAddress: string) {
    try {
      return await this.restRequest(`/v1/orderbook/fee/${orderbook}/${chainId}/${contractAddress}`)
    } catch (error: any) {
      throw new Error(`Failed to get orderbook fees: ${error.message}`)
    }
  }
  
  async getSupportedCurrencies(chainId: string, contractAddress: string, orderbook: string) {
    try {
      return await this.restRequest(`/v1/orderbook/currencies/${chainId}/${contractAddress}/${orderbook}`)
    } catch (error: any) {
      throw new Error(`Failed to get supported currencies: ${error.message}`)
    }
  }
  
  // Poll API methods
  async pollEvents(eventTypes?: string[], limit?: number, finalizedOnly: boolean = true, cursor?: string) {
    try {
      const params = new URLSearchParams()
      
      if (eventTypes && eventTypes.length > 0) {
        eventTypes.forEach(type => params.append('eventTypes', type))
      }
      
      if (limit) {
        params.append('limit', limit.toString())
      }
      
      if (cursor) {
        params.append('cursor', cursor)
      }
      
      params.append('finalizedOnly', finalizedOnly.toString())
      
      return await this.restRequest(`/v1/poll?${params.toString()}`)
    } catch (error: any) {
      throw new Error(`Failed to poll events: ${error.message}`)
    }
  }
  
  async acknowledgeEvent(lastEventId: number) {
    try {
      const response = await this.restRequest(`/v1/poll/ack/${lastEventId}`, {
        method: 'POST'
      })
      // Handle empty responses from the API
      return response || { success: true, message: 'Acknowledged' }
    } catch (error: any) {
      // Handle case where API returns empty response
      if (error.message.includes('Unexpected end of JSON input')) {
        console.warn('Received empty response from acknowledge endpoint, treating as success')
        return { success: true, message: 'Acknowledged' }
      }
      throw new Error(`Failed to acknowledge event: ${error.message}`)
    }
  }
  
  async resetPolling(eventId: number) {
    try {
      const response = await this.restRequest(`/v1/poll/reset/${eventId}`, {
        method: 'POST'
      })
      // Handle empty responses from the API
      return response || { success: true, message: 'Reset successful' }
    } catch (error: any) {
      throw new Error(`Failed to reset polling: ${error.message}`)
    }
  }
  
  // Enhanced Poll API methods with better typing and error handling
  async pollEventsWithTypes(eventTypes?: DomaEventType[], limit?: number, finalizedOnly: boolean = true, cursor?: string) {
    try {
      const params = new URLSearchParams()
      
      if (eventTypes && eventTypes.length > 0) {
        eventTypes.forEach(type => params.append('eventTypes', type))
      }
      
      if (limit) {
        params.append('limit', limit.toString())
      }
      
      if (cursor) {
        params.append('cursor', cursor)
      }
      
      params.append('finalizedOnly', finalizedOnly.toString())
      
      const response = await this.restRequest(`/v1/poll?${params.toString()}`)
      return response as PollEventsResponse
    } catch (error: any) {
      throw new Error(`Failed to poll events: ${error.message}`)
    }
  }
  
  async acknowledgeEventWithResponse(lastEventId: number): Promise<AcknowledgeEventResponse> {
    try {
      const response = await this.restRequest(`/v1/poll/ack/${lastEventId}`, {
        method: 'POST'
      })
      // Handle empty responses from the API
      return response as AcknowledgeEventResponse || { success: true, message: 'Acknowledged' }
    } catch (error: any) {
      // Handle case where API returns empty response
      if (error.message.includes('Unexpected end of JSON input')) {
        console.warn('Received empty response from acknowledge endpoint, treating as success')
        return { success: true, message: 'Acknowledged' }
      }
      throw new Error(`Failed to acknowledge event: ${error.message}`)
    }
  }
  
  async resetPollingWithResponse(eventId: number): Promise<ResetPollingResponse> {
    try {
      const response = await this.restRequest(`/v1/poll/reset/${eventId}`, {
        method: 'POST'
      })
      // Handle empty responses from the API
      return response as ResetPollingResponse || { success: true, message: 'Reset successful' }
    } catch (error: any) {
      // Handle case where API returns empty response
      if (error.message.includes('Unexpected end of JSON input')) {
        console.warn('Received empty response from reset endpoint, treating as success')
        return { success: true, message: 'Reset successful' }
      }
      throw new Error(`Failed to reset polling: ${error.message}`)
    }
  }
  
  // Additional helper methods
  async getDomainByName(name: string, useCache: boolean = false) {
    const query = `
      query GetDomainByName($name: String!) {
        name(name: $name) {
          name
          expiresAt
          tokenizedAt
          eoi
          registrar {
            ianaId
            name
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
            listings {
              id
              externalId
              price
              offererAddress
              orderbook
              currency {
                name
                symbol
                decimals
              }
              expiresAt
              createdAt
              updatedAt
            }
            activities {
              ... on TokenMintedActivity {
                type
                tokenId
                createdAt
                owner: to
                txHash
                finalized
              }
              ... on TokenTransferredActivity {
                type
                tokenId
                createdAt
                transferredFrom
                transferredTo
                txHash
                finalized
              }
              ... on TokenListedActivity {
                type
                tokenId
                createdAt
                orderId
                startsAt
                expiresAt
                seller
                buyer
                payment {
                  price
                  tokenAddress
                  currencySymbol
                }
                orderbook
                txHash
                finalized
              }
              ... on TokenOfferReceivedActivity {
                type
                tokenId
                createdAt
                orderId
                expiresAt
                buyer
                seller
                payment {
                  price
                  tokenAddress
                  currencySymbol
                }
                orderbook
                txHash
                finalized
              }
              ... on TokenListingCancelledActivity {
                type
                tokenId
                createdAt
                orderId
                reason
                orderbook
                txHash
                finalized
              }
              ... on TokenOfferCancelledActivity {
                type
                tokenId
                createdAt
                orderId
                reason
                orderbook
                txHash
                finalized
              }
              ... on TokenPurchasedActivity {
                type
                tokenId
                createdAt
                orderId
                purchasedAt
                seller
                buyer
                payment {
                  price
                  tokenAddress
                  currencySymbol
                }
                orderbook
                txHash
                finalized
              }
            }
          }
          activities {
            ... on NameClaimedActivity {
              type
              txHash
              sld
              tld
              createdAt
              claimedBy
            }
            ... on NameRenewedActivity {
              type
              txHash
              sld
              tld
              createdAt
              expiresAt
            }
            ... on NameDetokenizedActivity {
              type
              txHash
              sld
              tld
              createdAt
              networkId
            }
            ... on NameTokenizedActivity {
              type
              txHash
              sld
              tld
              createdAt
              networkId
            }
          }
        }
      }
    `
    
    const cacheKey = `domain_${name}`;
    const data = await this.graphqlRequest(query, { name }, useCache, cacheKey)
    return data.name
  }

  // New comprehensive method to get domain statistics
  async getDomainStatistics(tokenId: string, useCache: boolean = false) {
    const query = `
      query GetNameStatistics($tokenId: String!) {
        nameStatistics(tokenId: $tokenId) {
          name
          highestOffer {
            id
            externalId
            price
            offererAddress
            orderbook
            currency {
              name
              symbol
              decimals
            }
            expiresAt
            createdAt
          }
          activeOffers
          offersLast3Days
        }
      }
    `
    
    const cacheKey = `stats_${tokenId}`;
    const data = await this.graphqlRequest(query, { tokenId }, useCache, cacheKey)
    return data.nameStatistics
  }

  // New method to get paginated listings with more filters
  async getPaginatedListings(filters: {
    skip?: number;
    take?: number;
    tlds?: string[];
    createdSince?: string;
    sld?: string;
    networkIds?: string[];
    registrarIanaIds?: number[];
    sortOrder?: 'ASC' | 'DESC';
  } = {}, useCache: boolean = false) {
    const query = `
      query GetPaginatedListings(
        $skip: Float,
        $take: Float,
        $tlds: [String!],
        $createdSince: DateTime,
        $sld: String,
        $networkIds: [String!],
        $registrarIanaIds: [Int!],
        $sortOrder: SortOrderType
      ) {
        listings(
          skip: $skip,
          take: $take,
          tlds: $tlds,
          createdSince: $createdSince,
          sld: $sld,
          networkIds: $networkIds,
          registrarIanaIds: $registrarIanaIds,
          sortOrder: $sortOrder
        ) {
          items {
            id
            externalId
            price
            offererAddress
            orderbook
            currency {
              name
              symbol
              decimals
            }
            expiresAt
            createdAt
            updatedAt
            name
            nameExpiresAt
            registrar {
              ianaId
              name
              websiteUrl
              supportEmail
            }
            tokenId
            tokenAddress
            chain {
              name
              networkId
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
    
    const cacheKey = `listings_${JSON.stringify(filters)}`;
    const data = await this.graphqlRequest(query, filters, useCache, cacheKey)
    return data.listings || { items: [], totalCount: 0 }
  }

  // New method to get paginated offers with more filters
  async getPaginatedOffers(filters: {
    tokenId?: string;
    offeredBy?: string[];
    skip?: number;
    take?: number;
    status?: 'ACTIVE' | 'EXPIRED' | 'All';
    sortOrder?: 'ASC' | 'DESC';
  } = {}, useCache: boolean = false) {
    const query = `
      query GetPaginatedOffers(
        $tokenId: String,
        $offeredBy: [AddressCAIP10!],
        $skip: Float,
        $take: Float,
        $status: OfferStatus,
        $sortOrder: SortOrderType
      ) {
        offers(
          tokenId: $tokenId,
          offeredBy: $offeredBy,
          skip: $skip,
          take: $take,
          status: $status,
          sortOrder: $sortOrder
        ) {
          items {
            id
            externalId
            price
            offererAddress
            orderbook
            currency {
              name
              symbol
              decimals
            }
            expiresAt
            createdAt
            name
            nameExpiresAt
            registrar {
              ianaId
              name
              websiteUrl
              supportEmail
            }
            tokenId
            tokenAddress
            chain {
              name
              networkId
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
    
    const cacheKey = `offers_${JSON.stringify(filters)}`;
    const data = await this.graphqlRequest(query, filters, useCache, cacheKey)
    return data.offers || { items: [], totalCount: 0 }
  }

  // New method to get name activities with pagination
  async getNameActivities(name: string, filters: {
    type?: string;
    skip?: number;
    take?: number;
    sortOrder?: 'ASC' | 'DESC';
  } = {}, useCache: boolean = false) {
    const query = `
      query GetNameActivities(
        $name: String!,
        $type: NameActivityType,
        $skip: Float,
        $take: Float,
        $sortOrder: SortOrderType
      ) {
        nameActivities(
          name: $name,
          type: $type,
          skip: $skip,
          take: $take,
          sortOrder: $sortOrder
        ) {
          items {
            ... on NameClaimedActivity {
              type
              txHash
              sld
              tld
              createdAt
              claimedBy
            }
            ... on NameRenewedActivity {
              type
              txHash
              sld
              tld
              createdAt
              expiresAt
            }
            ... on NameDetokenizedActivity {
              type
              txHash
              sld
              tld
              createdAt
              networkId
            }
            ... on NameTokenizedActivity {
              type
              txHash
              sld
              tld
              createdAt
              networkId
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
    
    const variables = { name, ...filters };
    const cacheKey = `name_activities_${name}_${JSON.stringify(filters)}`;
    const data = await this.graphqlRequest(query, variables, useCache, cacheKey)
    return data.nameActivities || { items: [], totalCount: 0 }
  }
  
  async getDomainActivities(tokenId: string, type?: string, limit: number = 50, useCache: boolean = false) {
    const query = `
      query GetTokenActivities($tokenId: String!, $type: TokenActivityType, $take: Float) {
        tokenActivities(tokenId: $tokenId, type: $type, take: $take, sortOrder: DESC) {
          items {
            ... on TokenMintedActivity {
              type
              tokenId
              createdAt
              owner: to
              txHash
              finalized
            }
            ... on TokenTransferredActivity {
              type
              tokenId
              createdAt
              transferredFrom
              transferredTo
              txHash
              finalized
            }
            ... on TokenListedActivity {
              type
              tokenId
              createdAt
              orderId
              startsAt
              expiresAt
              seller
              buyer
              payment {
                price
                tokenAddress
                currencySymbol
              }
              orderbook
              txHash
              finalized
            }
            ... on TokenOfferReceivedActivity {
              type
              tokenId
              createdAt
              orderId
              expiresAt
              buyer
              seller
              payment {
                price
                tokenAddress
                currencySymbol
              }
              orderbook
              txHash
              finalized
            }
            ... on TokenListingCancelledActivity {
              type
              tokenId
              createdAt
              orderId
              reason
              orderbook
              txHash
              finalized
            }
            ... on TokenOfferCancelledActivity {
              type
              tokenId
              createdAt
              orderId
              reason
              orderbook
              txHash
              finalized
            }
            ... on TokenPurchasedActivity {
              type
              tokenId
              createdAt
              orderId
              purchasedAt
              seller
              buyer
              payment {
                price
                tokenAddress
                currencySymbol
              }
              orderbook
              txHash
              finalized
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
    
    const cacheKey = `activities_${tokenId}_${type || 'all'}_${limit}`;
    const data = await this.graphqlRequest(query, { tokenId, type, take: limit }, useCache, cacheKey)
    return data.tokenActivities || { items: [], totalCount: 0 }
  }
}

// Export a singleton instance
export const domaApi = new DomaApiClient()