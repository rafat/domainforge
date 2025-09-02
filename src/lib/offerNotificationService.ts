// src/lib/offerNotificationService.ts
// Service for handling real-time offer notifications using Doma's Poll API

import { domaApi } from './domaApi'
import { DomaEvent } from '@/types/domaEvents'

export class OfferNotificationService {
  private static instance: OfferNotificationService
  private isPolling: boolean = false
  private pollingInterval: NodeJS.Timeout | null = null
  private lastProcessedEventId: number | null = null
  private listeners: Map<string, Set<(event: DomaEvent) => void>> = new Map()

  private constructor() {}

  static getInstance(): OfferNotificationService {
    if (!OfferNotificationService.instance) {
      OfferNotificationService.instance = new OfferNotificationService()
    }
    return OfferNotificationService.instance
  }

  // Subscribe to offer events for a specific domain
  subscribeToOfferEvents(domainId: string, callback: (event: DomaEvent) => void) {
    if (!this.listeners.has(domainId)) {
      this.listeners.set(domainId, new Set())
    }
    
    this.listeners.get(domainId)!.add(callback)
    
    // Start polling if not already started
    if (!this.isPolling) {
      this.startPolling()
    }
    
    // Return unsubscribe function
    return () => {
      const domainListeners = this.listeners.get(domainId)
      if (domainListeners) {
        domainListeners.delete(callback)
        if (domainListeners.size === 0) {
          this.listeners.delete(domainId)
        }
      }
      
      // Stop polling if no more listeners
      if (this.listeners.size === 0) {
        this.stopPolling()
      }
    }
  }

  // Start polling for events
  private async startPolling() {
    if (this.isPolling) return
    
    this.isPolling = true
    console.log('Starting offer notification polling...')
    
    // Poll every 10 seconds
    this.pollingInterval = setInterval(() => {
      this.pollEvents()
    }, 10000)
  }

  // Stop polling for events
  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
    this.isPolling = false
    console.log('Stopped offer notification polling')
  }

  // Poll for new events
  private async pollEvents() {
    try {
      // Poll for offer-related events
      const response = await domaApi.pollEventsWithTypes(
        ['NAME_OFFER_MADE', 'NAME_PURCHASED', 'NAME_CANCELLED'],
        10, // Limit to 10 events
        true // Only finalized events
      )
      
      if (!response.events || response.events.length === 0) {
        return
      }
      
      // Process each event
      for (const event of response.events) {
        // Skip events we've already processed
        if (this.lastProcessedEventId && event.id <= this.lastProcessedEventId) {
          continue
        }
        
        // Handle the event based on type
        await this.handleEvent(event)
        
        // Acknowledge the event
        try {
          await domaApi.acknowledgeEventWithResponse(event.id)
        } catch (error) {
          console.error('Failed to acknowledge event:', error)
        }
        
        // Update last processed event ID
        this.lastProcessedEventId = event.id
      }
    } catch (error) {
      console.error('Error polling offer events:', error)
    }
  }

  // Handle a single event
  private async handleEvent(event: DomaEvent) {
    console.log(`Handling event ${event.id} of type ${event.type}`)
    
    try {
      // Extract domain ID from event data
      const domainId = event.data?.tokenId || event.data?.name
      
      if (!domainId) {
        console.warn('Could not extract domain ID from event:', event)
        return
      }
      
      // Notify listeners for this domain
      const domainListeners = this.listeners.get(domainId)
      if (domainListeners) {
        domainListeners.forEach(callback => {
          try {
            callback(event)
          } catch (error) {
            console.error('Error in offer event callback:', error)
          }
        })
      }
      
      // Also notify global listeners (if we implement them)
      const globalListeners = this.listeners.get('global')
      if (globalListeners) {
        globalListeners.forEach(callback => {
          try {
            callback(event)
          } catch (error) {
            console.error('Error in global event callback:', error)
          }
        })
      }
    } catch (error) {
      console.error('Error handling event:', error)
    }
  }

  // Reset polling to a specific event ID (useful for debugging)
  async resetPolling(eventId: number = 0) {
    try {
      await domaApi.resetPollingWithResponse(eventId)
      this.lastProcessedEventId = eventId
      console.log(`Reset polling to event ID ${eventId}`)
    } catch (error) {
      console.error('Failed to reset polling:', error)
    }
  }
}

// Export singleton instance
export const offerNotificationService = OfferNotificationService.getInstance()