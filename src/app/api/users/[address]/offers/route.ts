import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  const { address } = params;

  try {
    // First, find all domains owned by this user
    const userDomains = await prisma.domain.findMany({
      where: {
        owner: address,
      },
      select: {
        id: true,
      },
    });

    const domainIds = userDomains.map(d => d.id);

    // Then find all offers for those domains
    const offers = await prisma.offer.findMany({
      where: {
        domainId: { in: domainIds },
      },
      include: {
        domain: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format offers to match the expected structure
    const formattedOffers = offers.map(offer => ({
      id: offer.id,
      externalId: offer.id, // Using id as externalId for consistency
      price: offer.amount,
      offererAddress: offer.buyer,
      orderbook: 'DOMA', // Default value
      currency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
      },
      expiresAt: offer.expiry || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now if not set
      createdAt: offer.createdAt,
      domainId: offer.domainId,
      buyer: offer.buyer,
      amount: offer.amount,
      status: offer.status,
    }));

    return NextResponse.json({ offers: formattedOffers });
  } catch (error) {
    console.error('Failed to fetch user offers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user offers' },
      { status: 500 }
    );
  }
}