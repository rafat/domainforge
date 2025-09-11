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
    return fetcher(`/api/doma/listings?tokenId=${tokenId}`);
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
    const data = await fetcher(`/api/doma/offers?tokenId=${tokenId}`);
    return data.offers || [];
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
  }
};