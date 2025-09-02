// src/app/api/doma/reset-polling/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { domaApi } from '@/lib/domaApi'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId } = body
    
    if (eventId === undefined) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }
    
    console.log(`Resetting polling to event ${eventId}`)
    
    // Reset polling
    const resetResponse = await domaApi.resetPollingWithResponse(eventId)
    
    const result = {
      success: true,
      reset: resetResponse,
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error resetting Doma polling:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}