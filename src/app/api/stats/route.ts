// src/app/api/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get total domains
    const totalDomains = await prisma.domain.count()
    
    // Get total sales (domains with transactions)
    const totalSales = await prisma.transaction.count()
    
    // Get average price of sold domains
    const transactions = await prisma.transaction.findMany({
      select: {
        amount: true
      }
    })
    
    let averagePrice = 0
    if (transactions.length > 0) {
      const totalAmount = transactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0)
      averagePrice = totalAmount / transactions.length
    }
    
    // Get active users (distinct owners)
    const activeUsers = await prisma.domain.groupBy({
      by: ['owner'],
      _count: {
        owner: true
      }
    })
    
    return NextResponse.json({
      totalDomains,
      totalSales,
      averagePrice,
      activeUsers: activeUsers.length
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}