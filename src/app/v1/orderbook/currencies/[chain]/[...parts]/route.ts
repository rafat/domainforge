// src/app/v1/orderbook/currencies/[chain]/[...parts]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { POST as currenciesPostHandler } from '@/app/api/doma/currencies/route';

export async function GET(
  request: NextRequest,
  { params }: { params: { chain: string; parts: string[] } }
) {
  const { chain, parts } = params;
  const orderbook = parts.pop();
  const contractAddress = parts.join('/');

  // Create a new request object that we can modify
  const newRequest = new NextRequest(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contractAddress,
      chainId: chain,
      orderbook,
    }),
  });

  // This route acts as a proxy to the actual implementation
  // to maintain compatibility with the Doma Orderbook SDK
  return currenciesPostHandler(newRequest);
}
