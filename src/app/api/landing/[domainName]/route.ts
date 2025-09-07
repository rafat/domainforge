// src/app/api/landing/[domainName]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domainName: string }> }
) {
  const { domainName } = await params

  try {
    // Fetch domain from database by name
    const domain = await prisma.domain.findUnique({
      where: { name: domainName }
    })

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      )
    }

    // Check if page is active
    if (!domain.isActive) {
      return NextResponse.json(
        { error: 'Landing page is not active' },
        { status: 404 }
      )
    }

    return NextResponse.json(domain);

  } catch (error) {
    console.error('Failed to fetch landing page data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch landing page data' },
      { status: 500 }
    )
  }
}
