import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// This function handles POST requests to /api/offers/[offerId] for REJECTING an offer.
// The 'accept' action is handled on the client-side.
export async function POST(request: Request, { params }: { params: { offerId: string } }) {
  const { offerId } = params;
  const { action, sellerAddress } = await request.json();

  if (action !== 'reject') {
    return NextResponse.json({ error: 'This endpoint only handles rejecting offers.' }, { status: 400 });
  }

  if (!sellerAddress) {
    return NextResponse.json({ error: 'Missing sellerAddress' }, { status: 400 });
  }

  try {
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { domain: true },
    });

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    if (offer.domain.owner.toLowerCase() !== sellerAddress.toLowerCase()) {
      return NextResponse.json({ error: 'Only the domain owner can perform this action' }, { status: 403 });
    }

    // Rejecting an offer is a simple status update in our local database.
    const updatedOffer = await prisma.offer.update({
      where: { id: offerId },
      data: { status: 'REJECTED' },
    });

    return NextResponse.json(updatedOffer);

  } catch (error) {
    console.error(`Failed to reject offer:`, error);
    return NextResponse.json({ error: `Failed to reject offer` }, { status: 500 });
  }
}