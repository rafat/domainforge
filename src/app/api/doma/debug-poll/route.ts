// src/app/api/doma/debug-poll/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { domaApi } from '@/lib/domaApi'

export async function GET(request: NextRequest) {
  try {
    // Test polling events
    console.log('Testing pollEvents method...')
    const events = await domaApi.pollEvents(['NAME_TOKENIZED', 'NAME_CLAIMED'], 5, true)
    console.log('pollEvents response:', JSON.stringify(events, null, 2))
    
    let ackResult = null
    if (events.events && events.events.length > 0) {
      // Test acknowledging the last event
      console.log('Testing acknowledgeEvent method...')
      const lastEventId = events.events[events.events.length - 1].id
      console.log('Acknowledging event ID:', lastEventId)
      ackResult = await domaApi.acknowledgeEvent(lastEventId)
      console.log('acknowledgeEvent response:', JSON.stringify(ackResult, null, 2))
    }
    
    const result = {
      success: true,
      eventsCount: events.events?.length || 0,
      events: events.events || [],
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
        stack: error.stack,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}