'use client'

import { useState, useEffect, useCallback } from 'react';

import { DomaOffer, DomaListing } from '@/types/doma';
import { useWallet } from '@/hooks/useWallet';
import { domaApi } from '@/lib/domaApi';
import { usePublicClient, useWalletClient } from 'wagmi';
import { parseUnits } from 'viem';



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
      
      const [offersData, listingsData] = await Promise.all([
        domaApi.getOffers(tokenId),
        domaApi.getListings(tokenId)
      ]);

      setOffers(offersData || []);
      setListings(listingsData.items || []);
    } catch (error: any) {
      console.error('Failed to fetch Doma offers/listings:', error);
      setDomaDataError(`Failed to load marketplace data: ${error.message}`);
    } finally {
      setLoadingDomaData(false);
    }
  }, [tokenId]);

  useEffect(() => {
    fetchDomaData();
  }, [fetchDomaData]);

  const handleBuyNow = async (activeListing: DomaListing) => {
    if (!activeListing || !address || !walletClient || !publicClient) {
      alert('Cannot proceed with purchase. Missing listing data or wallet connection.');
      return;
    }

    setIsBuying(true);
    try {
      // 1. Get fulfillment data from Doma API
      const fulfillmentData = await domaApi.getListingFulfillmentData(
        activeListing.externalId,
        address
      );

      if (!fulfillmentData || !fulfillmentData.parameters) {
        throw new Error('Failed to get listing fulfillment data.');
      }

      // 2. Prepare transaction using viem
      const { parameters } = fulfillmentData;
      const transactionRequest = {
        account: address,
        to: parameters.conduitKey, // Or the appropriate contract address from fulfillmentData
        data: parameters.data, // The calldata for the transaction
        value: parseUnits(activeListing.price.toString(), activeListing.currency.decimals), // Convert price to BigInt
        // gas: parameters.gas, // Optional: if gas limit is provided
      };

      // 3. Send transaction via wallet client
      const hash = await walletClient.sendTransaction(transactionRequest);
      alert(`Transaction sent! Hash: ${hash}`);

      // 4. Wait for transaction confirmation (optional but good UX)
      // const receipt = await publicClient.waitForTransactionReceipt({ hash });
      // alert(`Transaction confirmed! Block: ${receipt.blockNumber}`);

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
