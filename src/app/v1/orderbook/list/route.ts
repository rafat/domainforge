// src/app/v1/orderbook/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { POST as listingsPostHandler } from '@/app/api/doma/listings/route';

export async function POST(request: NextRequest) {
  // This route acts as a proxy to the actual implementation
  // to maintain compatibility with the Doma Orderbook SDK
  return listingsPostHandler(request);
}
