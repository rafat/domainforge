// src/lib/domaOrderbookSdk.ts
import { 
  createDomaOrderbookClient, 
  OrderbookType, 
  viemToEthersSigner,
  DomaOrderbookSDKConfig,
  Caip2ChainId,
  OnProgressCallback,
  CreateListingParams,
  BuyListingParams,
  CancelListingParams,
  GetOrderbookFeeRequest,
  GetSupportedCurrenciesRequest,
  CreateOfferParams
} from '@doma-protocol/orderbook-sdk';
import { parseEther, parseUnits } from 'viem';
import { domaTestnet } from './chains';

// Helper function to create SDK client
function createClient() {
  const apiKey = process.env.NEXT_PUBLIC_DOMA_API_KEY || '';
  
  return createDomaOrderbookClient({
    source: 'domainforge',
    chains: [domaTestnet],
    apiClientOptions: {
      baseUrl: process.env.NEXT_PUBLIC_DOMA_API_URL || 'https://api-testnet.doma.xyz',
      defaultHeaders: {
        'Api-Key': apiKey,
      },
    },
  });
}

/**
 * Creates a listing using the Doma Protocol Orderbook SDK
 * @param params Listing parameters
 * @param walletClient Viem wallet client
 * @returns Promise with listing result
 */
export async function createDomaListing(
  params: {
    contractAddress: string;
    tokenId: string;
    price: string; // in ETH
    sellerAddress: string;
  },
  walletClient: any,
  chainId: Caip2ChainId = 'eip155:97476', // Doma testnet
  fees?: any,
  currency?: any
) {
  try {
    // Debug logging
    console.log('Creating Doma listing with params:', params);
    console.log('Contract address being used:', params.contractAddress);
    
    // Convert Viem wallet client to Ethers signer
    const signer = viemToEthersSigner(walletClient, chainId);
    
    // Create a new SDK client instance with the API key
    const domaOrderbookClient = createClient();
    console.log('Doma API Key being used for listing creation');
    
    // Prepare listing parameters - simplified to match working code
    const listingParams: CreateListingParams = {
      items: [{
        contract: params.contractAddress,
        tokenId: params.tokenId,
        price: currency ? 
          parseUnits(params.price, currency.decimals).toString() : 
          parseEther(params.price).toString(),
        duration: 30 * 24 * 3600 * 1000, // default 30 days in milliseconds
        // For native ETH, we should not include currencyContractAddress
        // For other currencies, include the contract address if available
        ...(currency && currency.contractAddress && currency.contractAddress !== "0x0000000000000000000000000000000000000000" && 
          { currencyContractAddress: currency.contractAddress })
      }],
      orderbook: OrderbookType.DOMA,
      source: 'domainforge',
      ...(fees && { marketplaceFees: fees }), // Only include fees if they exist
    };
    
    // Debug logging
    console.log('Listing params being sent to SDK:', listingParams);
    
    const onProgress: OnProgressCallback = (progress) => {
      console.log('Creating listing progress:', progress);
    };
    
    const result = await domaOrderbookClient.createListing({
      params: listingParams,
      signer,
      chainId,
      onProgress
    });
    
    console.log('Doma listing creation result:', result);
    return result;
  } catch (error) {
    console.error('Error creating Doma listing:', error);
    throw error;
  }
}

export async function createDomaOffer(
  params: {
    contractAddress: string;
    tokenId: string;
    price: string; // in ETH
    buyerAddress: string;
  },
  walletClient: any,
  chainId: Caip2ChainId = 'eip155:97476', // Doma testnet
  fees?: any,
  currency?: any
) {
  try {
    console.log('Creating Doma offer with params:', params);

    const signer = viemToEthersSigner(walletClient, chainId);
    const domaOrderbookClient = createClient();

    // Explicitly define the item to be offered
    const offerItem: any = {
      contract: params.contractAddress,
      tokenId: params.tokenId,
      duration: 30 * 24 * 3600 * 1000, // 30 days
    };

    // Explicitly handle currency and price
    if (currency && currency.contractAddress && currency.contractAddress !== '0x0000000000000000000000000000000000000000') {
      offerItem.price = parseUnits(params.price, currency.decimals).toString();
      offerItem.currencyContractAddress = currency.contractAddress;
    } else {
      // Default to native ETH
      offerItem.price = parseEther(params.price).toString();
      offerItem.currencyContractAddress = '0x0000000000000000000000000000000000000000';
    }

    const offerParams: CreateOfferParams = {
      items: [offerItem],
      orderbook: OrderbookType.DOMA,
      source: 'domainforge',
      ...(fees && { marketplaceFees: fees }),
    };

    console.log('Offer params being sent to SDK:', offerParams);

    const onProgress: OnProgressCallback = (progress) => {
      console.log('Creating offer progress:', progress);
    };

    const result = await domaOrderbookClient.createOffer({
      params: offerParams,
      signer,
      chainId,
      onProgress
    });

    console.log('Doma offer creation result:', result);
    return result;
  } catch (error) {
    console.error('Error creating Doma offer:', error);
    throw error;
  }
}

export async function buyDomaListing(
  params: {
    orderId: string;
    buyerAddress: string;
  },
  walletClient: any,
  chainId: Caip2ChainId = 'eip155:97476' // Doma testnet
) {
  try {
    // Convert Viem wallet client to Ethers signer
    const signer = viemToEthersSigner(walletClient, chainId);
    
    // Create a new SDK client instance
    const domaOrderbookClient = createClient();
    
    // Buy listing using Doma SDK
    // Note: The BuyListingParams only requires orderId, not fulfillerAddress
    const listingParams: BuyListingParams = {
      orderId: params.orderId,
    };
    
    const onProgress: OnProgressCallback = (progress) => {
      console.log('Buying listing progress:', progress);
    };
    
    const result = await domaOrderbookClient.buyListing({
      params: listingParams,
      signer,
      chainId,
      onProgress
    });
    
    return result;
  } catch (error) {
    console.error('Error buying Doma listing:', error);
    throw error;
  }
}

export async function acceptDomaOffer(
  params: {
    orderId: string;
    buyerAddress: string;
  },
  walletClient: any,
  chainId: Caip2ChainId = 'eip155:97476'
) {
  console.log('Accepting Doma offer by calling buyDomaListing with:', params);
  // Accepting an offer is functionally the same as buying a listing from the offerer
  return buyDomaListing(params, walletClient, chainId);
}

export async function cancelDomaListing(
  params: {
    orderId: string;
  },
  walletClient: any,
  chainId: Caip2ChainId = 'eip155:97476' // Doma testnet
) {
  try {
    // Convert Viem wallet client to Ethers signer
    const signer = viemToEthersSigner(walletClient, chainId);
    
    // Create a new SDK client instance
    const domaOrderbookClient = createClient();
    
    // Cancel listing using Doma SDK
    const listingParams: CancelListingParams = {
      orderId: params.orderId,
    };
    
    const onProgress: OnProgressCallback = (progress) => {
      console.log('Cancelling listing progress:', progress);
    };
    
    const result = await domaOrderbookClient.cancelListing({
      params: listingParams,
      signer,
      chainId,
      onProgress
    });
    
    return result;
  } catch (error) {
    console.error('Error cancelling Doma listing:', error);
    throw error;
  }
}

export async function getDomaMarketplaceFees(
  contractAddress: string,
  chainId: Caip2ChainId = 'eip155:97476' // Doma testnet
) {
  try {
    // Use our proxy API to fetch fees
    const response = await fetch('/api/doma/fees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contractAddress,
        chainId,
        orderbook: 'DOMA',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch fees: ${errorData.details?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.marketplaceFees;
  } catch (error) {
    console.error('Error fetching Doma marketplace fees:', error);
    throw error;
  }
}

export async function getDomaSupportedCurrencies(
  chainId: Caip2ChainId = 'eip155:97476', // Doma testnet
  contractAddress: string
) {
  try {
    // Use our proxy API to fetch currencies
    const response = await fetch('/api/doma/currencies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contractAddress,
        chainId,
        orderbook: 'DOMA',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch currencies: ${errorData.details?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.currencies;
  } catch (error) {
    console.error('Error fetching Doma supported currencies:', error);
    throw error;
  }
}

export { OrderbookType };
