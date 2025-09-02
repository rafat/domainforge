// src/lib/doma.ts
// Service layer that uses the Doma API client

import { domaApi } from './domaApi'
import { DomaOffer, OwnershipHistory } from '@/types/doma'

export class DomaService {
  async getDomainInfo(tokenId: string, useCache: boolean = false) {
    try {
      const token = await domaApi.getToken(tokenId, useCache)
      
      if (!token) {
        throw new Error('Domain not found')
      }
      
      // Get metadata from the name
      const metadata = {
        name: token.name?.name || `token-${tokenId}`,
        description: `Tokenized domain ${token.name?.name || tokenId}`,
        image: null, // Would need to generate or fetch domain image
        attributes: [
          {
            trait_type: 'Registrar',
            value: token.name?.registrar?.name || 'Unknown'
          },
          {
            trait_type: 'Network',
            value: token.chain?.name || 'Unknown'
          }
        ]
      }
      
      return {
        tokenId,
        owner: token.ownerAddress,
        metadata,
        name: token.name?.name,
        expirationDate: token.expiresAt ? new Date(token.expiresAt) : null,
        registrarId: token.name?.registrar?.ianaId || null,
        chainId: token.chain?.networkId || null,
        createdAt: token.createdAt ? new Date(token.createdAt) : null
      }
    } catch (error: any) {
      throw new Error(`Failed to fetch domain info: ${error.message}`)
    }
  }
  
  async getOrderBookOffers(tokenId: string, useCache: boolean = false): Promise<DomaOffer[]> {
    try {
      const offersResponse = await domaApi.getOffers(tokenId, 'ACTIVE', useCache)
      return offersResponse.items || []
    } catch (error: any) {
      throw new Error(`Failed to fetch offers: ${error.message}`)
    }
  }
  
  async getOrderBookListings(tokenId: string, useCache: boolean = false) {
    try {
      const listingsResponse = await domaApi.getListings(tokenId, 'ACTIVE', useCache)
      return listingsResponse.items || []
    } catch (error: any) {
      throw new Error(`Failed to fetch listings: ${error.message}`)
    }
  }
  
  async getOwnershipHistory(tokenId: string, useCache: boolean = false): Promise<OwnershipHistory[]> {
    try {
      const token = await domaApi.getToken(tokenId, useCache)
      
      if (!token) {
        throw new Error('Domain not found')
      }
      
      // Transform activities into ownership history
      const activities = token.activities || []
      return activities
        .filter((activity: any) => 
          activity.type === 'MINTED' || 
          activity.type === 'TRANSFERRED'
        )
        .map((activity: any) => ({
          tokenId: activity.tokenId,
          type: activity.type,
          from: activity.transferredFrom || activity.owner || null,
          to: activity.transferredTo || activity.owner || null,
          timestamp: activity.createdAt
        }))
    } catch (error: any) {
      throw new Error(`Failed to fetch ownership history: ${error.message}`)
    }
  }
  
  async createOffer(tokenId: string, amount: string, currency: string = 'ETH') {
    try {
      // Get token information to prepare offer parameters
      const token = await this.getDomainInfo(tokenId);
      
      if (!token) {
        throw new Error('Domain not found');
      }
      
      // Prepare offer parameters for Doma's Orderbook API
      const offerData = {
        orderbook: 'DOMA', // Use Doma's orderbook
        chainId: 'eip155:97476', // Doma testnet chain ID
        parameters: {
          offerer: token.owner, // The buyer making the offer
          zone: '0x0000000000000000000000000000000000000000', // No zone for now
          orderType: 2, // Partial fillable offer
          startTime: Math.floor(Date.now() / 1000).toString(), // Current time
          endTime: (Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60).toString(), // 7 days from now
          zoneHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
          salt: Math.floor(Math.random() * 1000000).toString(),
          offer: [
            {
              itemType: 1, // ERC20
              token: '0x0000000000000000000000000000000000000000', // ETH
              identifierOrCriteria: '0',
              startAmount: amount,
              endAmount: amount
            }
          ],
          consideration: [
            {
              itemType: 2, // ERC721
              token: process.env.NEXT_PUBLIC_OWNERSHIP_TOKEN_ADDRESS || '0x424bDf2E8a6F52Bd2c1C81D9437b0DC0309DF90f',
              identifierOrCriteria: tokenId,
              startAmount: '1',
              endAmount: '1',
              recipient: token.owner // Domain owner
            }
          ],
          totalOriginalConsiderationItems: 1,
          conduitKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
          counter: '0'
        }
      };
      
      // Create offer using Doma's Orderbook API
      const response = await domaApi.createOffer(offerData);
      return response;
    } catch (error: any) {
      throw new Error(`Failed to create offer: ${error.message}`);
    }
  }
  
  async createListing(tokenId: string, price: string, signer: any, listingParams: any) {
    try {
      // For API-first approach, we would use Doma's Orderbook API
      // This is a placeholder implementation that would need to be
      // connected to the actual REST API endpoints
      
      throw new Error('Listing creation via API not yet implemented - need to integrate with Doma Orderbook API')
    } catch (error: any) {
      throw new Error(`Failed to create listing: ${error.message}`)
    }
  }
  
  // New method to get domain metadata with additional Doma-specific info
  async getDomainMetadata(tokenId: string, useCache: boolean = false) {
    try {
      // This now uses the Subgraph API approach
      return await this.getDomainInfo(tokenId, useCache)
    } catch (error: any) {
      throw new Error(`Failed to fetch domain metadata: ${error.message}`)
    }
  }
  
  // New method to get domain listings
  async getDomainListings(tokenId: string, useCache: boolean = false) {
    try {
      const token = await domaApi.getToken(tokenId, useCache)
      return token?.listings || []
    } catch (error: any) {
      throw new Error(`Failed to fetch listings: ${error.message}`)
    }
  }
  
  // New method to get domain activities with pagination support
  async getDomainActivities(tokenId: string, type?: string, limit?: number, useCache: boolean = false) {
    try {
      const activitiesResponse = await domaApi.getDomainActivities(tokenId, type, limit, useCache)
      return activitiesResponse.items || []
    } catch (error: any) {
      throw new Error(`Failed to fetch domain activities: ${error.message}`)
    }
  }
  
  // New method to get domains by owner with pagination support
  async getDomainsByOwner(ownerAddress: string, limit: number = 100, skip: number = 0, useCache: boolean = false) {
    try {
      const names = await domaApi.getNames({
        ownedBy: [ownerAddress],
        take: limit,
        skip: skip
      }, useCache)
      return names.items || []
    } catch (error: any) {
      throw new Error(`Failed to fetch domains by owner: ${error.message}`)
    }
  }
  
  // New method to get domain statistics
  async getDomainStatistics(tokenId: string, useCache: boolean = false) {
    try {
      return await domaApi.getDomainStatistics(tokenId, useCache)
    } catch (error: any) {
      throw new Error(`Failed to fetch domain statistics: ${error.message}`)
    }
  }
  
  // New method to get paginated listings
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
    try {
      const listings = await domaApi.getPaginatedListings(filters, useCache)
      return listings
    } catch (error: any) {
      throw new Error(`Failed to fetch paginated listings: ${error.message}`)
    }
  }
  
  // New method to get paginated offers
  async getPaginatedOffers(filters: {
    tokenId?: string;
    offeredBy?: string[];
    skip?: number;
    take?: number;
    status?: 'ACTIVE' | 'EXPIRED' | 'All';
    sortOrder?: 'ASC' | 'DESC';
  } = {}, useCache: boolean = false) {
    try {
      const offers = await domaApi.getPaginatedOffers(filters, useCache)
      return offers
    } catch (error: any) {
      throw new Error(`Failed to fetch paginated offers: ${error.message}`)
    }
  }
  
  // New method to check if an offer is still active
  async isOfferActive(offerId: string, tokenId: string, useCache: boolean = false): Promise<boolean> {
    try {
      // Check if offer exists in active offers
      const { items: activeOffers } = await domaApi.getOffers(tokenId, 'ACTIVE', useCache)
      const isActive = activeOffers.some((offer: any) => 
        offer.externalId === offerId || offer.id === offerId
      )
      
      return isActive
    } catch (error: any) {
      console.error('Failed to check offer status:', error)
      return false
    }
  }
  
  // New method to check if an offer is expired
  async isOfferExpired(offerId: string, tokenId: string, useCache: boolean = false): Promise<boolean> {
    try {
      // Check if offer exists in expired offers
      const { items: expiredOffers } = await domaApi.getOffers(tokenId, 'EXPIRED', useCache)
      const isExpired = expiredOffers.some((offer: any) => 
        offer.externalId === offerId || offer.id === offerId
      )
      
      return isExpired
    } catch (error: any) {
      console.error('Failed to check offer expiration:', error)
      return false
    }
  }
}
