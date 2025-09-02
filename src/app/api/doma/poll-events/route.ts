// src/app/api/doma/poll-events/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { domaApi } from '@/lib/domaApi'
import { DomaEventType } from '@/types/domaEvents'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventTypesParam = searchParams.get('eventTypes')
    const limitParam = searchParams.get('limit')
    const finalizedOnlyParam = searchParams.get('finalizedOnly')
    
    let eventTypes: DomaEventType[] | undefined
    let limit: number | undefined
    let finalizedOnly = true
    
    if (eventTypesParam) {
      eventTypes = eventTypesParam.split(',') as DomaEventType[]
    }
    
    if (limitParam) {
      limit = parseInt(limitParam, 10)
    }
    
    if (finalizedOnlyParam) {
      finalizedOnly = finalizedOnlyParam === 'true'
    }

    console.log('Polling events with parameters:', { eventTypes, limit, finalizedOnly })
    
    // Poll for events
    const eventsResponse = await domaApi.pollEventsWithTypes(
      eventTypes,
      limit,
      finalizedOnly
    )
    
    console.log(`Received ${eventsResponse.events?.length || 0} events`)
    
    const result = {
      success: true,
      events: eventsResponse.events || [],
      count: eventsResponse.events?.length || 0,
      hasMore: eventsResponse.hasMore,
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error polling Doma events:', error)
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId } = body
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }
    
    console.log(`Acknowledging event ${eventId}`)
    
    // Acknowledge the event
    const ackResponse = await domaApi.acknowledgeEventWithResponse(eventId)
    
    const result = {
      success: true,
      acknowledged: ackResponse,
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error acknowledging Doma event:', error)
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