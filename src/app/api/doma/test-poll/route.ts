// src/app/api/doma/test-poll/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { domaApi } from '@/lib/domaApi'

export async function GET(request: NextRequest) {
  try {
    // Test polling events
    console.log('Testing pollEvents method...')
    const events = await domaApi.pollEvents(['NAME_TOKENIZED', 'NAME_CLAIMED'], 5, true)
    console.log('pollEvents successful')
    
    let ackResult = null
    if (events.events && events.events.length > 0) {
      // Test acknowledging the last event
      console.log('Testing acknowledgeEvent method...')
      const lastEventId = events.events[events.events.length - 1].id
      ackResult = await domaApi.acknowledgeEvent(lastEventId)
      console.log('acknowledgeEvent successful')
    }
    
    const result = {
      success: true,
      eventsCount: events.events?.length || 0,
      acknowledged: ackResult !== null,
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error testing Poll API:', error)
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