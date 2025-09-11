// src/app/api/doma/fees/route.ts
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

    // Use the SDK to get orderbook fees
    const response = await domaOrderbookClient.getOrderbookFee({
      contractAddress,
      chainId,
      orderbook: orderbook as OrderbookType,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in Doma fees proxy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Doma fees', details: { message: error.message, stack: error.stack } },
      { status: 500 }
    );
  }
}
