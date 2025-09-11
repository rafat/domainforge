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

    // Filter out WETH as in the working example
    const result = {
      currencies: response.currencies.filter((c: any) => c.symbol !== "WETH")
    };
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in Doma currencies proxy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Doma currencies', details: { message: error.message, stack: error.stack } },
      { status: 500 }
    );
  }
}