// src/lib/domaApi.ts
// Dedicated client for Doma Protocol APIs
import { 
  PollEventsResponse, 
  AcknowledgeEventResponse, 
  ResetPollingResponse,
  DomaEventType
} from '@/types/domaEvents'

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
  
  private async graphqlRequest(query: string, variables: any = {}) {
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
  async getToken(tokenId: string) {
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
            }
            ... on TokenTransferredActivity {
              type
              tokenId
              createdAt
              transferredFrom
              transferredTo
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
            }
          }
        }
      }
    `
    
    const data = await this.graphqlRequest(query, { tokenId })
    return data.token
  }
  
  async getOffers(tokenId: string, status: string = 'ACTIVE') {
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
        }
      }
    `
    
    const data = await this.graphqlRequest(query, { tokenId, status })
    return data.offers?.items || []
  }
  
  async getListings(tokenId: string, status: string = 'ACTIVE') {
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
        }
      }
    `
    
    const data = await this.graphqlRequest(query, { tokenId, status })
    return data.listings?.items || []
  }
  
  async getNames(filters: any = {}) {
    const query = `
      query GetNames($ownedBy: [AddressCAIP10!], $name: String, $tlds: [String!], $skip: Int, $take: Int) {
        names(ownedBy: $ownedBy, name: $name, tlds: $tlds, skip: $skip, take: $take) {
          items {
            name
            expiresAt
            tokenizedAt
            registrar {
              ianaId
              name
            }
            tokens {
              tokenId
              ownerAddress
              chain {
                networkId
                name
              }
              expiresAt
              type
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
    
    const data = await this.graphqlRequest(query, filters)
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
  async getDomainByName(name: string) {
    const query = `
      query GetDomainByName($name: String!) {
        name(name: $name) {
          name
          expiresAt
          tokenizedAt
          registrar {
            ianaId
            name
          }
          tokens {
            tokenId
            ownerAddress
            chain {
              networkId
              name
            }
            expiresAt
            type
          }
        }
      }
    `
    
    const data = await this.graphqlRequest(query, { name })
    return data.name
  }
  
  async getDomainActivities(tokenId: string, type?: string, limit: number = 50) {
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
        }
      }
    `
    
    const data = await this.graphqlRequest(query, { tokenId, type, take: limit })
    return data.tokenActivities?.items || []
  }
}

// Export a singleton instance
export const domaApi = new DomaApiClient()