// src/lib/domaApi.ts
// CLIENT-SIDE SAFE
// This file provides client-side functions to interact with your application's API routes.
// It does not contain any sensitive information like API keys.

import { DomaOffer } from '@/types/doma';

async function fetcher(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    // Attach extra info to the error object.
    const info = await res.json();
    (error as any).info = info;
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
}

export const domaApi = {
  async getListings(tokenId: string) {
    return fetcher(`/api/doma/listings?tokenId=${tokenId}`);
  },

  async createListing(parameters: any, signature: string) {
    return fetcher('/api/doma/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
};
