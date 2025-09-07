// src/app/api/test/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Test database connection by counting domains
    const count = await prisma.domain.count()
    
    return NextResponse.json({ 
      message: 'API is working correctly',
      domainCount: count,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { error: 'Database connection failed', details: (error as Error).message },
      { status: 500 }
    )
  }
}