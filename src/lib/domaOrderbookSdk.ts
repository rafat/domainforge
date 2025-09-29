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
  // For browser requests, we'll make API calls to our proxy routes
  // For server-side requests, we can directly use the Doma API
  const isBrowser = typeof window !== 'undefined';
  
  return createDomaOrderbookClient({
    source: 'domainforge',
    chains: [domaTestnet],
    apiClientOptions: {
      // For browser, use our proxy to handle response sanitization
      baseUrl: isBrowser 
        ? '' // Will use relative paths to our Next.js API routes
        : (process.env.DOMA_API_URL || 'https://api-testnet.doma.xyz'), // Server-side direct API
      defaultHeaders: {
        'Api-Key': process.env.DOMA_API_KEY || '',
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
    const listingItem: any = {
      contract: params.contractAddress,
      tokenId: params.tokenId,
      price: currency ? 
        parseUnits(params.price, currency.decimals).toString() : 
        parseEther(params.price).toString(),
      duration: 30 * 24 * 3600 * 1000, // default 30 days in milliseconds
    };
    
    // Handle currencyContractAddress based on currency properties
    if (currency) {
      // For native ETH (zero address), set currencyContractAddress to null to avoid balanceOf calls
      // but still provide the property so the SDK doesn't try to access undefined
      if (currency.contractAddress === '0x0000000000000000000000000000000000000000') {
        listingItem.currencyContractAddress = null;
        console.log('Setting currencyContractAddress to null for native ETH in listing to avoid balanceOf calls');
      } else {
        // For other currencies, always include currencyContractAddress
        listingItem.currencyContractAddress = currency.contractAddress;
        console.log('Setting currencyContractAddress for ERC-20 token in listing to:', currency.contractAddress);
      }
    }
    
    const listingParams: CreateListingParams = {
      items: [listingItem],
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
    
    // If no currency is provided, fetch the default currency (ETH) for Doma
    let resolvedCurrency = currency;
    if (!currency) {
      // Default to native ETH for Doma
      resolvedCurrency = {
        contractAddress: '0x0000000000000000000000000000000000000000', // Native ETH
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      };
      console.log('Using default ETH currency for offer creation');
    } else {
      // Handle case where API returns currency with null contractAddress (e.g., for native ETH)
      resolvedCurrency = {
        ...currency,
        contractAddress: currency.contractAddress || '0x0000000000000000000000000000000000000000' // Use zero address as fallback for native ETH
      };
      console.log('Using provided currency:', resolvedCurrency);
    }

    // Explicitly define the item to be offered with all required properties
    const offerItem: any = {
      contract: params.contractAddress,
      tokenId: params.tokenId,
      price: resolvedCurrency ? 
        parseUnits(params.price, resolvedCurrency.decimals).toString() : 
        parseEther(params.price).toString(),
      duration: 30 * 24 * 3600 * 1000, // 30 days in milliseconds
    };

    // Handle currencyContractAddress based on currency properties
    if (resolvedCurrency) {
      // For native ETH (zero address), set currencyContractAddress to null to avoid balanceOf calls
      // but still provide the property so the SDK doesn't try to access undefined
      if (resolvedCurrency.contractAddress === '0x0000000000000000000000000000000000000000') {
        offerItem.currencyContractAddress = null;
        console.log('Setting currencyContractAddress to null for native ETH to avoid balanceOf calls');
      } else {
        // For other currencies, always include currencyContractAddress
        offerItem.currencyContractAddress = resolvedCurrency.contractAddress;
        console.log('Setting currencyContractAddress for ERC-20 token to:', resolvedCurrency.contractAddress);
      }
    }
    
    // Log the complete offer item for debugging
    console.log('Complete offer item:', offerItem);

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
  chainId: Caip2ChainId = 'eip155:97476',
  fees?: any,
  currency?: any
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

// Helper function to fetch supported currencies for a domain
export async function fetchDomaCurrencies(
  contractAddress: string,
  chainId: Caip2ChainId = 'eip155:97476',
  orderbook: string = 'DOMA'
) {
  try {
    const response = await fetch('/api/doma/currencies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contractAddress,
        chainId,
        orderbook,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch currencies: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    // Find ETH currency, prioritizing native ETH over wrapped versions
    let ethCurrency = result.currencies.find((c: any) => 
      c.symbol === 'ETH' && 
      (c.contractAddress === '0x0000000000000000000000000000000000000000' || c.nativeWrapper === true)
    );
    
    // If no native ETH found, try to find any ETH currency
    if (!ethCurrency) {
      ethCurrency = result.currencies.find((c: any) => c.symbol === 'ETH');
    }
    
    // Handle case where ETH currency has null contractAddress (for native ETH)
    if (ethCurrency && ethCurrency.contractAddress === null) {
      ethCurrency = {
        ...ethCurrency,
        contractAddress: '0x0000000000000000000000000000000000000000', // Set to zero address for native ETH
        nativeWrapper: true
      };
    }
    
    if (ethCurrency) {
      return ethCurrency;
    }
    
    // Check first available currency for null contractAddress
    let firstCurrency = result.currencies[0];
    if (firstCurrency && firstCurrency.contractAddress === null) {
      firstCurrency = {
        ...firstCurrency,
        contractAddress: '0x0000000000000000000000000000000000000000', // Set to zero address for native ETH
        nativeWrapper: true
      };
    }
    
    return firstCurrency || {
      contractAddress: '0x0000000000000000000000000000000000000000',
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
      nativeWrapper: true
    };
  } catch (error) {
    console.error('Error fetching currencies:', error);
    // Return default ETH currency if API call fails
    return {
      contractAddress: '0x0000000000000000000000000000000000000000',
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
      nativeWrapper: true
    };
  }
}

export { OrderbookType };
