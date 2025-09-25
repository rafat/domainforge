import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  const { address } = params;

  try {
    // Fetch user's domain registrations
    const domainRegistrations = await prisma.domain.findMany({
      where: {
        owner: address,
      },
      select: {
        id: true,
        name: true,
        registrationDate: true,
        tokenId: true,
      },
      orderBy: {
        registrationDate: 'desc',
      },
    });

    // Fetch user's transactions (sales where user was seller)
    const transactions = await prisma.transaction.findMany({
      where: {
        seller: address,
      },
      select: {
        id: true,
        domainId: true,
        buyer: true,
        amount: true,
        status: true,
        createdAt: true,
        txHash: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Fetch received offers for user's domains
    const offerDomains = await prisma.domain.findMany({
      where: {
        owner: address,
      },
      select: {
        id: true,
      },
    });

    const domainIds = offerDomains.map(d => d.id);
    const receivedOffers = await prisma.offer.findMany({
      where: {
        domainId: { in: domainIds },
      },
      select: {
        id: true,
        domainId: true,
        buyer: true,
        amount: true,
        status: true,
        expiry: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform data into activity format
    const activities = [
      ...domainRegistrations.map(reg => ({
        id: `reg-${reg.id}`,
        type: 'domain_registration',
        domainName: reg.name,
        tokenId: reg.tokenId,
        timestamp: reg.registrationDate,
        status: 'completed',
      })),
      ...transactions.map(tx => ({
        id: `tx-${tx.id}`,
        type: 'domain_sale',
        domainId: tx.domainId,
        buyer: tx.buyer,
        amount: tx.amount,
        txHash: tx.txHash,
        timestamp: tx.createdAt,
        status: tx.status,
      })),
      ...receivedOffers.map(offer => ({
        id: `offer-${offer.id}`,
        type: 'offer_received',
        domainId: offer.domainId,
        buyer: offer.buyer,
        amount: offer.amount,
        timestamp: offer.createdAt,
        status: offer.status,
        expiry: offer.expiry,
      })),
    ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20); // Limit to 20 most recent activities

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Failed to fetch user activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user activities' },
      { status: 500 }
    );
  }
}