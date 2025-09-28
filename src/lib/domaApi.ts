// src/lib/domaApi.ts
// CLIENT-SIDE SAFE
// This file provides client-side functions to interact with your application's API routes.
// It does not contain any sensitive information like API keys.

import { DomaOffer } from '@/types/doma';

async function fetcher(url: string, options?: RequestInit) {
  console.log(`Fetching ${url} with options:`, JSON.stringify(options, null, 2));
  const res = await fetch(url, options);
  console.log(`Response status: ${res.status}`);
  console.log(`Response status text: ${res.statusText}`);
  
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    // Attach extra info to the error object.
    try {
      const info = await res.json();
      (error as any).info = info;
      console.log('Error info:', JSON.stringify(info, null, 2));
    } catch (e) {
      // If we can't parse the response as JSON, use the text instead
      try {
        (error as any).info = { message: await res.text() };
        console.log('Error text:', (error as any).info.message);
      } catch (e2) {
        (error as any).info = { message: 'Unknown error' };
        console.log('Unknown error');
      }
    }
    (error as any).status = res.status;
    throw error;
  }
  
  const data = await res.json();
  console.log('Response data:', JSON.stringify(data, null, 2));
  return data;
}

export const domaApi = {
  async getListings(tokenId: string) {
    console.log('Fetching listings for tokenId:', tokenId);
    try {
      const result = await fetcher(`/api/doma/listings?tokenId=${tokenId}`);
      console.log('Listings result:', result);
      console.log('Listings result type:', typeof result);
      if (result && typeof result === 'object') {
        console.log('Listings result keys:', Object.keys(result));
      }
      // Handle different possible data structures
      if (Array.isArray(result)) {
        return result;
      } else if (result && typeof result === 'object') {
        if (Array.isArray(result.listings)) {
          return result.listings;
        } else if (Array.isArray(result.items)) {
          return result.items;
        }
      }
      return [];
    } catch (error) {
      console.error('Error fetching listings:', error);
      throw error;
    }
  },

  async createListing(parameters: any, signature: string) {
    return fetcher('/api/doma/listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ parameters, signature }),
    });
  },

  async updateListing(listingId: string, tokenId: string, newPrice: string, walletAddress: string, signature: string) {
    return fetcher(`/api/doma/listings/${listingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokenId, newPrice, walletAddress, signature }),
    });
  },

  async cancelListing(listingId: string, walletAddress: string, signature: string) {
    return fetcher(`/api/doma/listings/${listingId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress, signature }),
    });
  },

  async getOffers(tokenId: string): Promise<DomaOffer[]> {
    console.log('Fetching offers for tokenId:', tokenId);
    try {
      const data = await fetcher(`/api/doma/offers?tokenId=${tokenId}`);
      console.log('Offers data:', data);
      return data.offers || [];
    } catch (error) {
      console.error('Error fetching offers:', error);
      throw error;
    }
  },

  async getListingFulfillmentData(listingId: string, buyerAddress: string) {
    return fetcher(`/api/doma/listings/${listingId}/fulfillment?buyerAddress=${buyerAddress}`);
  },
  
  // New methods for Doma Orderbook SDK integration
  async createListingWithSdk(params: {
    contractAddress: string;
    tokenId: string;
    price: string;
    sellerAddress: string;
  }) {
    return fetcher('/api/doma/listings/sdk-demo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
  },
  
  async createOffer(tokenId: string, amount: string, buyerAddress: string) {
    return fetcher('/api/doma/offers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tokenId, amount, buyerAddress }),
    });
  }
};