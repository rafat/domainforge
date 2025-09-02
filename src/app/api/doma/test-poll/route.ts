// src/app/api/doma/test-poll/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { domaApi } from '@/lib/domaApi'

export async function GET(request: NextRequest) {
  try {
    // Test polling events with enhanced method
    console.log('Testing pollEventsWithTypes method...')
    const eventsResponse = await domaApi.pollEventsWithTypes(['NAME_TOKENIZED', 'NAME_CLAIMED'], 5, true)
    console.log('pollEventsWithTypes successful')
    
    let ackResult = null
    if (eventsResponse.events && eventsResponse.events.length > 0) {
      // Test acknowledging the last event with enhanced method
      console.log('Testing acknowledgeEventWithResponse method...')
      const lastEventId = eventsResponse.events[eventsResponse.events.length - 1].id
      ackResult = await domaApi.acknowledgeEventWithResponse(lastEventId)
      console.log('acknowledgeEventWithResponse successful')
    }
    
    const result = {
      success: true,
      eventsCount: eventsResponse.events?.length || 0,
      events: eventsResponse.events || [],
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