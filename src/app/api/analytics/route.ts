// src/app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenId = searchParams.get('tokenId')
    const period = searchParams.get('period') || '30' // days

    if (!tokenId) {
      return NextResponse.json({ error: 'Token ID is required' }, { status: 400 })
    }

    const days = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get view analytics
    const views = await prisma.analytics.findMany({
      where: {
        tokenId,
        eventType: 'view',
        timestamp: {
          gte: startDate
        }
      },
      orderBy: { timestamp: 'desc' }
    })

    // Get offer analytics
    const offers = await prisma.analytics.findMany({
      where: {
        tokenId,
        eventType: 'offer',
        timestamp: {
          gte: startDate
        }
      },
      orderBy: { timestamp: 'desc' }
    })

    // Group by date
    const viewsByDate = views.reduce((acc: Record<string, number>, view: any) => {
      const date = view.timestamp.toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const offersByDate = offers.reduce((acc: Record<string, number>, offer: any) => {
      const date = offer.timestamp.toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Get unique visitors
    const uniqueVisitors = new Set(views.map((v: any) => v.userAddress)).size

    // Get total stats
    const totalViews = views.length
    const totalOffers = offers.length

    return NextResponse.json({
      totalViews,
      totalOffers,
      uniqueVisitors,
      viewsByDate,
      offersByDate,
      period: days
    })
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tokenId, eventType, userAddress, metadata } = await request.json()

    if (!tokenId || !eventType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const analytics = await prisma.analytics.create({
      data: {
        tokenId,
        eventType,
        userAddress,
        metadata: metadata ? JSON.stringify(metadata) : null,
        timestamp: new Date()
      }
    })

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Failed to create analytics entry:', error)
    return NextResponse.json(
      { error: 'Failed to create analytics entry' },
      { status: 500 }
    )
  }
}