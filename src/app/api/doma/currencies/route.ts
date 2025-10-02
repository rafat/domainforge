// src/app/api/doma/currencies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createDomaOrderbookClient, OrderbookType } from '@doma-protocol/orderbook-sdk';
import { domaTestnet } from '@/lib/chains';

export async function POST(request: NextRequest) {
  try {
    const { contractAddress, chainId, orderbook } = await request.json();

    if (!contractAddress || !chainId || !orderbook) {
      return NextResponse.json(
        { error: 'contractAddress, chainId, and orderbook are required' },
        { status: 400 }
      );
    }

    // Create the SDK client
    const domaOrderbookClient = createDomaOrderbookClient({
      source: 'domainforge',
      chains: [domaTestnet],
      apiClientOptions: {
        baseUrl: process.env.NEXT_PUBLIC_DOMA_API_URL || 'https://api-testnet.doma.xyz',
        defaultHeaders: {
          'Api-Key': process.env.DOMA_API_KEY || '',
        },
      },
    });

    // Use the SDK to get supported currencies
    const response = await domaOrderbookClient.getSupportedCurrencies({
      contractAddress,
      chainId,
      orderbook: orderbook as OrderbookType,
    });

    // Process currencies to properly handle native ETH and filter out unwanted ones
    const processedCurrencies = response.currencies
      .map((currency: any) => {
        // Handle case where contractAddress is null (for native ETH)
        if (currency.contractAddress === null) {
          return {
            ...currency,
            contractAddress: '0x0000000000000000000000000000000000000000', // Zero address for native ETH
            nativeWrapper: true
          };
        }
        // Explicitly mark native ETH
        if (currency.contractAddress === '0x0000000000000000000000000000000000000000') {
          return {
            ...currency,
            nativeWrapper: true
          };
        }
        return currency;
      })
      // Filter out WETH as it's not needed for our use case
      .filter((c: any) => c.symbol !== "WETH");

    const result = {
      currencies: processedCurrencies
    };
    
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Error in Doma currencies proxy:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch Doma currencies', details: { message } },
      { status: 500 }
    );
  }
}