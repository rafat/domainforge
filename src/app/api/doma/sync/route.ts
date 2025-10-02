// src/app/api/doma/sync/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { domaPollService } from '@/lib/domaPollService'
import { DomaEventType } from '@/types/domaEvents'

export async function GET(request: NextRequest) {
  try {
    // Allow both authenticated and client requests for demo purposes
    const authHeader = request.headers.get('authorization')
    const expectedToken = `Bearer ${process.env.CRON_AUTH_TOKEN}`
    
    // Rate limiting - only sync if last sync was more than 30 seconds ago
    const lastSyncKey = 'last-sync-timestamp'
    const lastSyncTime = parseInt(process.env[lastSyncKey] || '0', 10)
    const currentTime = Date.now()
    const timeSinceLastSync = currentTime - lastSyncTime
    
    // Skip sync if less than 30 seconds since last sync (unless forced)
    const forceSync = request.nextUrl.searchParams.get('force') === 'true'
    if (!forceSync && timeSinceLastSync < 30000) {
      return NextResponse.json({
        success: true,
        message: 'Sync skipped - too soon since last sync',
        skipped: true,
        timeSinceLastSync: timeSinceLastSync,
        nextSyncIn: 30000 - timeSinceLastSync
      })
    }

    // Process events that might affect domain listings and ownership
    const eventTypes: DomaEventType[] = [
      'NAME_TRANSFERRED',
      'NAME_PURCHASED',
      'NAME_LISTED',
      'NAME_CANCELLED',
      'NAME_EXPIRED'
    ]

    console.log('Starting Doma event synchronization...')
    await domaPollService.processEvents(eventTypes, 10) // Limit to 10 events for client calls
    console.log('Doma event synchronization completed')

    // Update last sync time (in a real implementation, you'd store this in a database)
    process.env[lastSyncKey] = currentTime.toString()

    return NextResponse.json({
      success: true,
      message: 'Doma event synchronization completed',
      timestamp: new Date().toISOString(),
      skipped: false
    })
  } catch (error: unknown) {
    console.error('Error in Doma synchronization:', error)
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        success: false, 
        error: message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}