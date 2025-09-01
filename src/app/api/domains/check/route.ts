// src/app/api/domains/check/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')

  if (!name) {
    return NextResponse.json(
      { error: 'Domain name is required' },
      { status: 400 }
    )
  }

  try {
    const existingDomain = await prisma.domain.findUnique({
      where: { name: name.toLowerCase() }
    })

    return NextResponse.json({
      available: !existingDomain,
      name: name.toLowerCase()
    })
  } catch (error) {
    console.error('Failed to check domain availability:', error)
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}
