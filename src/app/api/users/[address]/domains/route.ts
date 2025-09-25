import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  const { address } = params;

  try {
    const domains = await prisma.domain.findMany({
      where: {
        owner: address,
      },
      include: {
        offers: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ domains });
  } catch (error) {
    console.error('Failed to fetch user domains:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user domains' },
      { status: 500 }
    );
  }
}