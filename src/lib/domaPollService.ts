// src/lib/domaPollService.ts
import { domaApi } from './domaApi'
import { DomaEvent, DomaEventType } from '@/types/domaEvents'
import { prisma } from './db'

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export class DomaPollService {
  private lastProcessedEventId: number | null = null
  private isProcessing: boolean = false
  private pollingInterval: NodeJS.Timeout | null = null

  constructor() {
    this.initializeLastProcessedEvent()
  }

  /**
   * Initialize the last processed event ID from database
   */
  private async initializeLastProcessedEvent() {
    try {
      const lastEvent = await prisma.analytics.findFirst({
        where: {
          eventType: 'DOMA_EVENT_PROCESSED'
        },
        orderBy: {
          timestamp: 'desc'
        }
      })

      if (lastEvent && lastEvent.metadata) {
        const metadata = JSON.parse(lastEvent.metadata)
        this.lastProcessedEventId = metadata.lastProcessedEventId || null
      }
    } catch (error) {
      console.warn('Failed to initialize last processed event ID:', error)
    }
  }

  /**
   * Save the last processed event ID to database
   */
  private async saveLastProcessedEvent(eventId: number) {
    try {
      await prisma.analytics.create({
        data: {
          tokenId: 'system',
          eventType: 'DOMA_EVENT_PROCESSED',
          metadata: JSON.stringify({ lastProcessedEventId: eventId })
        }
      })
      this.lastProcessedEventId = eventId
    } catch (error) {
      console.error('Failed to save last processed event ID:', error)
    }
  }

  /**
   * Retry a function with exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = MAX_RETRIES,
    delay: number = RETRY_DELAY
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        
        if (i === maxRetries) {
          throw error;
        }
        
        console.warn(`Attempt ${i + 1} failed, retrying in ${delay}ms...`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
    
    throw lastError;
  }

  /**
   * Process Doma events
   */
  async processEvents(eventTypes?: DomaEventType[], limit: number = 10) {
    if (this.isProcessing) {
      console.log('Already processing events, skipping...')
      return
    }

    this.isProcessing = true

    try {
      console.log('Polling Doma events...')
      
      // Poll for events with retry mechanism
      const response: any = await this.retryWithBackoff(() => 
        domaApi.pollEventsWithTypes(
          eventTypes,
          limit,
          true // finalizedOnly
        )
      )

      if (!response || !response.events || response.events.length === 0) {
        console.log('No new events to process')
        return
      }

      console.log(`Processing ${response.events.length} events...`)

      // Process each event
      for (const event of response.events) {
        await this.handleEvent(event)
        
        // Acknowledge the event with retry mechanism
        try {
          await this.retryWithBackoff(() => 
            domaApi.acknowledgeEvent(event.id) // Use correct method name
          )
          console.log(`Acknowledged event ${event.id}`)
          
          // Save the last processed event ID
          await this.saveLastProcessedEvent(event.id)
        } catch (error) {
          console.error(`Failed to acknowledge event ${event.id}:`, error)
        }
      }

      console.log('Finished processing events')
    } catch (error) {
      console.error('Error processing Doma events:', error)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Handle a single Doma event
   */
  private async handleEvent(event: DomaEvent) {
    console.log(`Handling event ${event.id} of type ${event.type}`)
    
    try {
      // Handle different event types
      switch (event.type) {
        case 'NAME_TOKENIZED':
          await this.handleNameTokenized(event)
          break
        case 'NAME_CLAIMED':
          await this.handleNameClaimed(event)
          break
        case 'NAME_TRANSFERRED':
          await this.handleNameTransferred(event)
          break
        case 'NAME_LISTED':
          await this.handleNameListed(event)
          break
        case 'NAME_OFFER_MADE':
          await this.handleNameOfferMade(event)
          break
        case 'NAME_PURCHASED':
          await this.handleNamePurchased(event)
          break
        case 'NAME_CANCELLED':
          await this.handleNameCancelled(event)
          break
        case 'NAME_EXPIRED':
          await this.handleNameExpired(event)
          break
        default:
          console.log(`Unhandled event type: ${event.type}`)
          break
      }
      
      // Log the event in our analytics with retry mechanism
      await this.retryWithBackoff(async () => {
        await prisma.analytics.create({
          data: {
            tokenId: event.data && event.data.tokenId ? event.data.tokenId : 'unknown',
            eventType: `DOMA_${event.type}`,
            metadata: JSON.stringify(event.data),
            timestamp: new Date(event.timestamp)
          }
        })
      })
    } catch (error) {
      console.error(`Error handling event ${event.id}:`, error)
      // Log the error in analytics as well
      try {
        await prisma.analytics.create({
          data: {
            tokenId: event.data && event.data.tokenId ? event.data.tokenId : 'unknown',
            eventType: `DOMA_EVENT_ERROR`,
            metadata: JSON.stringify({
              eventId: event.id,
              eventType: event.type,
              error: error instanceof Error ? error.message : String(error)
            }),
            timestamp: new Date()
          }
        })
      } catch (analyticsError) {
        console.error('Failed to log error to analytics:', analyticsError)
      }
    }
  }

  /**
   * Handle NAME_TOKENIZED event
   */
  private async handleNameTokenized(event: DomaEvent) {
    console.log('Handling NAME_TOKENIZED event:', event.data)
    // TODO: Implement domain creation in our database
  }

  /**
   * Handle NAME_CLAIMED event
   */
  private async handleNameClaimed(event: DomaEvent) {
    console.log('Handling NAME_CLAIMED event:', event.data)
    // TODO: Implement domain claiming logic
  }

  /**
   * Handle NAME_TRANSFERRED event
   */
  private async handleNameTransferred(event: DomaEvent) {
    console.log('Handling NAME_TRANSFERRED event:', event.data)
    // Update domain ownership in our database
    if (event.data && event.data.tokenId && event.data.newOwner) {
      try {
        await this.retryWithBackoff(async () => {
          await prisma.domain.update({
            where: {
              tokenId: event.data.tokenId
            },
            data: {
              owner: event.data.newOwner,
              updatedAt: new Date()
            }
          })
        })
        console.log(`Updated ownership for domain ${event.data.tokenId}`)
      } catch (error) {
        console.error(`Failed to update ownership for domain ${event.data.tokenId}:`, error)
      }
    }
  }

  /**
   * Handle NAME_LISTED event
   */
  private async handleNameListed(event: DomaEvent) {
    console.log('Handling NAME_LISTED event:', event.data)
    // Update domain listing status in our database
    if (event.data && event.data.tokenId) {
      try {
        await this.retryWithBackoff(async () => {
          await prisma.domain.update({
            where: {
              tokenId: event.data.tokenId
            },
            data: {
              forSale: true,
              price: event.data.price ? event.data.price.toString() : null,
              buyNowPrice: event.data.price ? event.data.price.toString() : null,
              updatedAt: new Date()
            }
          })
        })
        console.log(`Updated listing status for domain ${event.data.tokenId}`)
      } catch (error) {
        console.error(`Failed to update listing status for domain ${event.data.tokenId}:`, error)
      }
    }
  }

  /**
   * Handle NAME_OFFER_MADE event
   */
  private async handleNameOfferMade(event: DomaEvent) {
    console.log('Handling NAME_OFFER_MADE event:', event.data)
    // Create offer in our database
    if (event.data && event.data.tokenId && event.data.buyer && event.data.amount) {
      try {
        const domain = await this.retryWithBackoff(async () => {
          return await prisma.domain.findUnique({
            where: {
              tokenId: event.data.tokenId
            }
          })
        })

        if (domain) {
          await this.retryWithBackoff(async () => {
            await prisma.offer.create({
              data: {
                domainId: domain.id,
                buyer: event.data.buyer,
                amount: event.data.amount.toString(),
                status: 'PENDING',
                expiry: event.data.expiry ? new Date(event.data.expiry) : undefined,
                updatedAt: new Date()
              }
            })
          })
          console.log(`Created offer for domain ${event.data.tokenId}`)
        }
      } catch (error) {
        console.error(`Failed to create offer for domain ${event.data.tokenId}:`, error)
      }
    }
  }

  /**
   * Handle NAME_PURCHASED event
   */
  private async handleNamePurchased(event: DomaEvent) {
    console.log('Handling NAME_PURCHASED event:', event.data);
    // Update domain ownership and clear listing status
    if (event.data && event.data.tokenId && event.data.buyer) {
      try {
        const updatedDomain = await this.retryWithBackoff(async () => {
          return await prisma.domain.update({
            where: {
              tokenId: event.data.tokenId
            },
            data: {
              owner: event.data.buyer,
              forSale: false,
              price: null,
              buyNowPrice: null,
              updatedAt: new Date()
            }
          })
        })
        console.log(`Updated ownership and listing status for domain ${event.data.tokenId}`)
        
        // Also update any active listings in our database
        await this.retryWithBackoff(async () => {
          await prisma.domain.updateMany({
            where: {
              tokenId: event.data.tokenId
            },
            data: {
              forSale: false,
              price: null,
              buyNowPrice: null,
              updatedAt: new Date()
            }
          })
        })
        
        // Update any pending offers to expired status
        if (updatedDomain) {
          await this.retryWithBackoff(async () => {
            await prisma.offer.updateMany({
              where: {
                domainId: updatedDomain.id,
                status: 'PENDING'
              },
              data: {
                status: 'EXPIRED',
                updatedAt: new Date()
              }
            })
          })
        }
      } catch (error) {
        console.error(`Failed to update domain ${event.data.tokenId} after purchase:`, error)
      }
    }
  }

  /**
   * Handle NAME_CANCELLED event
   */
  private async handleNameCancelled(event: DomaEvent) {
    console.log('Handling NAME_CANCELLED event:', event.data)
    // Update listing status or offer status
    if (event.data && event.data.tokenId && event.data.orderId) {
      try {
        // Try to update listing first
        const listingResult = await this.retryWithBackoff(async () => {
          return await prisma.domain.update({
            where: {
              tokenId: event.data.tokenId
            },
            data: {
              forSale: false,
              price: null,
              buyNowPrice: null,
              updatedAt: new Date()
            }
          })
        })
        
        if (listingResult) {
          console.log(`Cancelled listing for domain ${event.data.tokenId}`)
          return
        }
        
        // If no listing found, try to cancel offer
        const domain = await this.retryWithBackoff(async () => {
          return await prisma.domain.findUnique({
            where: {
              tokenId: event.data.tokenId
            }
          })
        })
        
        if (domain) {
          await this.retryWithBackoff(async () => {
            await prisma.offer.updateMany({
              where: {
                domainId: domain.id,
                status: 'PENDING'
              },
              data: {
                status: 'REJECTED',
                updatedAt: new Date()
              }
            })
          })
          console.log(`Cancelled offers for domain ${event.data.tokenId}`)
        }
      } catch (error) {
        console.error(`Failed to handle cancellation for domain ${event.data.tokenId}:`, error)
      }
    }
  }

  /**
   * Handle NAME_EXPIRED event
   */
  private async handleNameExpired(event: DomaEvent) {
    console.log('Handling NAME_EXPIRED event:', event.data)
    // Update domain expiration status
    if (event.data && event.data.tokenId) {
      try {
        await this.retryWithBackoff(async () => {
          await prisma.domain.update({
            where: {
              tokenId: event.data.tokenId
            },
            data: {
              forSale: false,
              price: null,
              buyNowPrice: null,
              updatedAt: new Date()
            }
          })
        })
        console.log(`Updated expiration status for domain ${event.data.tokenId}`)
      } catch (error) {
        console.error(`Failed to update expiration status for domain ${event.data.tokenId}:`, error)
      }
    }
  }

  /**
   * Start periodic polling
   */
  startPolling(intervalMs: number = 30000, eventTypes?: DomaEventType[]) {
    if (this.pollingInterval) {
      console.log('Polling already started')
      return
    }

    console.log(`Starting Doma event polling every ${intervalMs}ms`)
    
    this.pollingInterval = setInterval(() => {
      this.processEvents(eventTypes)
    }, intervalMs)
  }

  /**
   * Stop periodic polling
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
      console.log('Stopped Doma event polling')
    }
  }

  /**
   * Reset polling to a specific event ID
   */
  async resetPollingToEvent(eventId: number) {
    try {
      await domaApi.resetPolling(eventId) // Use correct method name
      this.lastProcessedEventId = eventId
      console.log(`Reset polling to event ${eventId}`)
    } catch (error) {
      console.error(`Failed to reset polling to event ${eventId}:`, error)
    }
  }

  /**
   * Get the last processed event ID
   */
  getLastProcessedEventId(): number | null {
    return this.lastProcessedEventId
  }
}

// Export a singleton instance
export const domaPollService = new DomaPollService()