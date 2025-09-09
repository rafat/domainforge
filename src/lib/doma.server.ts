// src/lib/doma.server.ts
// This file is for SERVER-SIDE use only.
// It contains the Doma API client and service that use the secret API key.

import { parseEther } from 'viem'
import { DomaOffer, OwnershipHistory } from '@/types/doma'
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
// IMPORTANT: This is a secret and should only be used on the server.
const DOMA_API_KEY = process.env.DOMA_API_KEY;

if (!DOMA_API_KEY) {
  console.warn('DOMA_API_KEY is not set. Doma API calls will likely fail.');
}

class DomaApiClient {
  private subgraphUrl: string
  private apiUrl: string
  private apiKey: string

  constructor() {
    this.subgraphUrl = DOMA_SUBGRAPH_URL
    this.apiUrl = DOMA_API_URL
    this.apiKey = DOMA_API_KEY || ''
    
    if (!this.apiKey) {
      console.error("Doma API key is missing. All API requests will fail.");
    }
  }

  private async graphqlRequest(query: string, variables: Record<string, unknown> = {}, useCache: boolean = false, cacheKey?: string) {
    const key = cacheKey || `graphql_${JSON.stringify({ query, variables })}`;
    
    if (useCache) {
      const cached = domaCache.get(key);
      if (cached) {
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

  async getToken(tokenId: string, useCache: boolean = false) {
    const query = `
      query GetToken($tokenId: String!) {
        token(tokenId: $tokenId) {
          tokenId
          ownerAddress
          chain {
            networkId
            name
          }
          createdAt
          expiresAt
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
        }
      }
    `
    
    const cacheKey = `token_${tokenId}`;
    const data = await this.graphqlRequest(query, { tokenId }, useCache, cacheKey)
    return data.token
  }

  async getListings(tokenId: string, status: string = 'ACTIVE', useCache: boolean = false) {
    try {
      const token = await this.getToken(tokenId, useCache);
      if (!token || !token.listings) {
        return { items: [], totalCount: 0 };
      }
      
      const filteredListings = status === 'ACTIVE' 
        ? token.listings.filter((l: any) => !l.expiresAt || new Date(l.expiresAt) > new Date())
        : token.listings;

      return {
        items: filteredListings,
        totalCount: filteredListings.length,
        pageSize: filteredListings.length,
        currentPage: 1,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      };
    } catch (error: any) {
      console.error(`Failed to get listings for token ${tokenId} via getToken:`, error);
      throw new Error(`Failed to get listings for token ${tokenId}: ${error.message}`);
    }
  }
  
  async getOffers(tokenId: string, status: string = 'ACTIVE', useCache: boolean = false) {
    const query = `
      query GetOffers($tokenId: String!) {
        offers(tokenId: $tokenId, sortOrder: DESC) {
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
    
    const cacheKey = `offers_${tokenId}_${status}`;
    const data = await this.graphqlRequest(query, { tokenId }, useCache, cacheKey)
    return data.offers || { items: [], totalCount: 0 }
  }

  async getName(name: string, useCache: boolean = false) {
    const query = `
      query GetName($name: String!) {
        name(name: $name) {
          name
          registrar {
            ianaId
            name
          }
          expiresAt
        }
      }
    `
    
    const cacheKey = `name_${name}`;
    const data = await this.graphqlRequest(query, { name }, useCache, cacheKey)
    return data.name
  }

  async getNameStatistics(tokenId: string, useCache: boolean = false) {
    const query = `
      query GetNameStatistics($tokenId: String!) {
        nameStatistics(tokenId: $tokenId) {
          name
          highestOffer {
            id
            price
            offererAddress
          }
          activeOffers
          offersLast3Days
        }
      }
    `
    
    const cacheKey = `name_statistics_${tokenId}`;
    const data = await this.graphqlRequest(query, { tokenId }, useCache, cacheKey)
    return data.nameStatistics
  }

  async createListing(listingData: any) {
    return this.restRequest('/v1/orderbook/list', {
      method: 'POST',
      body: JSON.stringify(listingData),
    });
  }

  async cancelListing(orderId: string, signature: string) {
    return this.restRequest('/v1/orderbook/listing/cancel', {
      method: 'POST',
      body: JSON.stringify({ orderId, signature }),
    });
  }

  async getListingFulfillmentData(listingId: string, buyerAddress: string) {
    return this.restRequest(`/v1/orderbook/listing/${listingId}/${buyerAddress}`);
  }
}

const domaApiClient = new DomaApiClient();

export class DomaService {
  async getDomainInfo(tokenId: string, useCache: boolean = false) {
    try {
      const [token, stats] = await Promise.all([
        domaApiClient.getToken(tokenId, useCache),
        domaApiClient.getNameStatistics(tokenId, useCache)
      ]);

      if (!token) {
        throw new Error('Domain not found');
      }

      const domainName = stats?.name;
      if (!domainName) {
        const metadata = {
          name: `token-${tokenId}`,
          description: `Tokenized domain ${tokenId}`,
          image: null,
          attributes: [
            { trait_type: 'Registrar', value: 'Unknown' },
            { trait_type: 'Network', value: token.chain?.name || 'Unknown' }
          ]
        };
        return {
          tokenId,
          owner: token.ownerAddress,
          metadata,
          name: `token-${tokenId}`,
          expirationDate: token.expiresAt ? new Date(token.expiresAt) : null,
          registrarId: null,
          chainId: token.chain?.networkId || null,
          createdAt: token.createdAt ? new Date(token.createdAt) : null
        };
      }

      const nameDetails = await domaApiClient.getName(domainName, useCache);

      const metadata = {
        name: nameDetails?.name || domainName,
        description: `Tokenized domain ${nameDetails?.name || domainName}`,
        image: null,
        attributes: [
          {
            trait_type: 'Registrar',
            value: nameDetails?.registrar?.name || 'Unknown'
          },
          {
            trait_type: 'Network',
            value: token.chain?.name || 'Unknown'
          }
        ]
      };
      
      return {
        tokenId,
        owner: token.ownerAddress,
        metadata,
        name: nameDetails?.name || domainName,
        expirationDate: token.expiresAt ? new Date(token.expiresAt) : null,
        registrarId: nameDetails?.registrar?.ianaId || null,
        chainId: token.chain?.networkId || null,
        createdAt: token.createdAt ? new Date(token.createdAt) : null
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch domain info: ${error.message}`);
    }
  }
  
  async getOrderBookOffers(tokenId: string, useCache: boolean = false): Promise<DomaOffer[]> {
    try {
      const offersResponse = await domaApiClient.getOffers(tokenId, 'ACTIVE', useCache)
      return offersResponse.items || []
    } catch (error: any) {
      throw new Error(`Failed to fetch offers: ${error.message}`)
    }
  }
  
  async getOrderBookListings(tokenId: string, useCache: boolean = false) {
    try {
      const listingsResponse = await domaApiClient.getListings(tokenId, 'ACTIVE', useCache)
      return listingsResponse.items || []
    } catch (error: any) {
      throw new Error(`Failed to fetch listings: ${error.message}`)
    }
  }

  async createListing(parameters: any, signature: string) {
    try {
      const listingData = {
        orderbook: 'DOMA',
        chainId: 'eip155:97476',
        parameters: parameters,
        signature: signature,
      };

      const response = await domaApiClient.createListing(listingData);
      return response;
    } catch (error: any) {
      throw new Error(`Failed to create listing: ${error.message}`);
    }
  }

  async updateListing(listingId: string, tokenId: string, newPrice: string, walletAddress: string) {
    try {
      // For now, we'll just create a new listing, as the API doesn't support updates directly.
      // A more robust implementation would first cancel the existing listing.
      // Return a mock response for now.
      return Promise.resolve({ success: true, message: 'Listing updated (mock)' });
    } catch (error: any) {
      throw new Error(`Failed to update listing: ${error.message}`);
    }
  }

  async cancelListing(listingId: string, walletAddress: string) {
    try {
      // The Doma API requires a signature to cancel a listing.
      // This needs to be implemented on the client-side and passed to the API.
      // For now, we'll just return a success message.
      // You would need to implement a way to sign the cancellation message on the client
      // and pass the signature to this method.
      // Example: await domaApiClient.cancelListing(listingId, signature);
      return Promise.resolve({ success: true, message: 'Listing cancelled (mock)' });
    } catch (error: any) {
      throw new Error(`Failed to cancel listing: ${error.message}`);
    }
  }

  async getListingFulfillmentData(listingId: string, buyerAddress: string) {
    try {
      return await domaApiClient.getListingFulfillmentData(listingId, buyerAddress);
    } catch (error: any) {
      throw new Error(`Failed to get listing fulfillment data: ${error.message}`);
    }
  }
}

export const domaServerService = new DomaService();