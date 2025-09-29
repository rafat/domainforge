// src/app/v1/orderbook/fee/[orderbook]/[chain]/[...contract]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { POST as feesPostHandler } from '@/app/api/doma/fees/route';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderbook: string; chain: string; contract: string[] } }
) {
  const { orderbook, chain, contract } = params;
  const contractAddress = contract.join('/');

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
  return feesPostHandler(newRequest);
}
