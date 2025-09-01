// src/lib/doma.ts
// Service layer that uses the Doma API client

import { domaApi } from './domaApi'
import { DomaOffer, OwnershipHistory } from '@/types/doma'

export class DomaService {
  async getDomainInfo(tokenId: string) {
    try {
      const token = await domaApi.getToken(tokenId)
      
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
  
  async getOrderBookOffers(tokenId: string): Promise<DomaOffer[]> {
    try {
      const offers = await domaApi.getOffers(tokenId)
      return offers
    } catch (error: any) {
      throw new Error(`Failed to fetch offers: ${error.message}`)
    }
  }
  
  async getOrderBookListings(tokenId: string) {
    try {
      const listings = await domaApi.getListings(tokenId)
      return listings
    } catch (error: any) {
      throw new Error(`Failed to fetch listings: ${error.message}`)
    }
  }
  
  async getOwnershipHistory(tokenId: string): Promise<OwnershipHistory[]> {
    try {
      const token = await domaApi.getToken(tokenId)
      
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
  
  async createOffer(tokenId: string, amount: string, signer: any, orderParams: any) {
    try {
      // For API-first approach, we would use Doma's Orderbook API
      // This is a placeholder implementation that would need to be
      // connected to the actual REST API endpoints
      
      // In a complete implementation, this would:
      // 1. Prepare offer parameters
      // 2. Sign the offer using the wallet
      // 3. Submit to Doma's Orderbook API
      // 4. Return the response
      
      throw new Error('Offer creation via API not yet implemented - need to integrate with Doma Orderbook API')
    } catch (error: any) {
      throw new Error(`Failed to create offer: ${error.message}`)
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
  async getDomainMetadata(tokenId: string) {
    try {
      // This now uses the Subgraph API approach
      return await this.getDomainInfo(tokenId)
    } catch (error: any) {
      throw new Error(`Failed to fetch domain metadata: ${error.message}`)
    }
  }
  
  // New method to get domain listings
  async getDomainListings(tokenId: string) {
    try {
      const token = await domaApi.getToken(tokenId)
      return token?.listings || []
    } catch (error: any) {
      throw new Error(`Failed to fetch listings: ${error.message}`)
    }
  }
  
  // New method to get domain activities
  async getDomainActivities(tokenId: string, type?: string, limit?: number) {
    try {
      const activities = await domaApi.getDomainActivities(tokenId, type, limit)
      return activities
    } catch (error: any) {
      throw new Error(`Failed to fetch domain activities: ${error.message}`)
    }
  }
  
  // New method to get domains by owner
  async getDomainsByOwner(ownerAddress: string, limit: number = 100) {
    try {
      const names = await domaApi.getNames({
        ownedBy: [ownerAddress],
        take: limit
      })
      return names.items || []
    } catch (error: any) {
      throw new Error(`Failed to fetch domains by owner: ${error.message}`)
    }
  }
}
