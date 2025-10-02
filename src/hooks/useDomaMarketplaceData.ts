'use client'

import { useState, useEffect, useCallback } from 'react';

import { DomaOffer, DomaListing } from '@/types/doma';
import { useWallet } from '@/hooks/useWallet';
import { domaApi } from '@/lib/domaApi';
import { usePublicClient, useWalletClient } from 'wagmi';
import { parseUnits } from 'viem';
import { buyDomaListing } from '@/lib/domaOrderbookSdk';

interface UseDomaMarketplaceDataProps {
  tokenId: string;
}

export function useDomaMarketplaceData({ tokenId }: UseDomaMarketplaceDataProps) {
  const { address, isConnected } = useWallet();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [offers, setOffers] = useState<DomaOffer[]>([]);
  const [listings, setListings] = useState<DomaListing[]>([]);
  const [loadingDomaData, setLoadingDomaData] = useState(true);
  const [domaDataError, setDomaDataError] = useState<string | null>(null);
  const [isBuying, setIsBuying] = useState(false);

  const fetchDomaData = useCallback(async () => {
    if (!tokenId) {
      setDomaDataError('No Doma Token ID available.');
      setLoadingDomaData(false);
      return;
    }

    try {
      setLoadingDomaData(true);
      setDomaDataError(null);
      
      console.log('Fetching Doma data for tokenId:', tokenId);
      const [offersData, listingsData] = await Promise.all([
        domaApi.getOffers(tokenId),
        domaApi.getListings(tokenId)
      ]);

      console.log('Offers data received:', offersData);
      console.log('Listings data received:', listingsData);
      console.log('Listings data type:', typeof listingsData);
      console.log('Is listingsData an array?', Array.isArray(listingsData));
      if (listingsData && typeof listingsData === 'object') {
        console.log('Listings data keys:', Object.keys(listingsData));
      }

      // Ensure we're setting the data correctly
      const offersArray = Array.isArray(offersData) ? offersData : [];
      const activeOffers = offersArray.filter(offer => 
        offer.status === 'PENDING' && new Date(offer.expiresAt) > new Date()
      );
      // Handle both possible data structures
      let listingsArray = [];
      if (Array.isArray(listingsData)) {
        listingsArray = listingsData;
      } else if (listingsData && typeof listingsData === 'object') {
        if (Array.isArray(listingsData.listings)) {
          listingsArray = listingsData.listings;
        } else if (Array.isArray(listingsData.items)) {
          listingsArray = listingsData.items;
        }
      }
      
      console.log('Processed active offers array:', activeOffers);
      console.log('Processed listings array:', listingsArray);

      setOffers(activeOffers);
      setListings(listingsArray);
    } catch (error: any) {
      console.error('Failed to fetch Doma offers/listings:', error);
      console.error('Error details:', error.message, error.stack);
      setDomaDataError(`Failed to load marketplace data: ${error.message}`);
    } finally {
      setLoadingDomaData(false);
    }
  }, [tokenId]);

  useEffect(() => {
    fetchDomaData();
  }, [fetchDomaData]);

  const handleBuyNow = async (activeListing: DomaListing) => {
    if (!activeListing || !address || !walletClient) {
      alert('Cannot proceed with purchase. Missing listing data or wallet connection.');
      return;
    }

    setIsBuying(true);
    try {
      // 1. Buy the listing using the Doma SDK
      const buyResult = await buyDomaListing(
        activeListing.externalId, // Pass the order ID
        walletClient // Pass the wallet client
        // chainId will use default (eip155:97476)
      );

      if (!buyResult) {
        throw new Error('Blockchain transaction failed or returned no result.');
      }

      // 2. If blockchain transaction is successful, update the database
      const response = await fetch(`/api/domains/${activeListing.tokenId}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyer: address,
          amount: activeListing.price,
          orderId: activeListing.externalId,
          txHash: buyResult.transactionHash || 'pending',
        }),
      });

      if (response.ok) {
        alert('Purchase successful! Domain ownership transferred.');
        // Refresh the data to reflect the purchase
        fetchDomaData();
      } else {
        const errorData = await response.json();
        console.error('Database update failed after successful purchase:', errorData);
        // Still show success since blockchain transaction was successful
        alert('Purchase successful on blockchain, but database update had issues. Please refresh the page.');
      }
    } catch (error: any) {
      console.error('Failed to buy domain:', error);
      alert(`Failed to buy domain: ${error.message}`);
    } finally {
      setIsBuying(false);
    }
  };

  return {
    offers,
    listings,
    loadingDomaData,
    domaDataError,
    isBuying,
    handleBuyNow,
    isConnected, // Expose isConnected for button state
    address // Expose address for display if needed
  };
}
