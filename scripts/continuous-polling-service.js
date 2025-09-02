// scripts/continuous-polling-service.js
// Continuous polling service implementation

class ContinuousPollingService {
  constructor() {
    this.isRunning = false;
    this.pollingInterval = null;
    this.lastProcessedEventId = 0;
    
    // Get API endpoints from environment variables
    this.DOMA_API_URL = process.env.NEXT_PUBLIC_DOMA_API_URL || 'https://api-testnet.doma.xyz';
    this.DOMA_API_KEY = process.env.DOMA_API_KEY;
    
    this.https = require('https');
  }
  
  async restRequest(endpoint, options = {}) {
    return new Promise((resolve, reject) => {
      const url = `${this.DOMA_API_URL}${endpoint}`;
      const defaultHeaders = {
        'Content-Type': 'application/json',
        'Api-Key': this.DOMA_API_KEY
      };
      
      const requestOptions = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      };
      
      const req = this.https.request(url, requestOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
              reject(new Error(`API error: ${res.statusCode} ${res.statusMessage}`));
              return;
            }
            
            // Handle empty responses
            if (!data || data.trim() === '') {
              resolve({});
              return;
            }
            
            const result = JSON.parse(data);
            resolve(result);
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(new Error(`Request error: ${error.message}`));
      });
      
      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  }
  
  async pollEvents() {
    try {
      console.log(`\n🔍 Polling for events (last processed ID: ${this.lastProcessedEventId})...`);
      
      // Poll for events
      const eventsResponse = await this.restRequest(`/v1/poll?limit=10&finalizedOnly=true`);
      const events = eventsResponse.events || [];
      
      console.log(`   Found ${events.length} events`);
      
      if (events.length > 0) {
        // Process events in order
        for (const event of events) {
          // Skip events we've already processed
          if (event.id <= this.lastProcessedEventId) {
            continue;
          }
          
          console.log(`   Processing ${event.type} event for "${event.name}" (ID: ${event.id})`);
          
          // Handle the event
          await this.handleEvent(event);
          
          // Acknowledge the event
          console.log(`   Acknowledging event ${event.id}...`);
          await this.restRequest(`/v1/poll/ack/${event.id}`, {
            method: 'POST'
          });
          console.log(`   ✅ Event ${event.id} acknowledged`);
          
          // Update last processed ID
          this.lastProcessedEventId = event.id;
        }
      } else {
        console.log('   No new events to process');
      }
    } catch (error) {
      console.error('❌ Error polling events:', error.message);
    }
  }
  
  async handleEvent(event) {
    // Handle different event types
    switch (event.type) {
      case 'NAME_TOKENIZED':
        await this.handleNameTokenized(event);
        break;
        
      case 'NAME_CLAIMED':
        await this.handleNameClaimed(event);
        break;
        
      case 'NAME_TRANSFERRED':
        await this.handleNameTransferred(event);
        break;
        
      case 'NAME_LISTED':
        await this.handleNameListed(event);
        break;
        
      case 'NAME_OFFER_MADE':
        await this.handleNameOfferMade(event);
        break;
        
      case 'NAME_PURCHASED':
        await this.handleNamePurchased(event);
        break;
        
      default:
        console.log(`     ℹ️  Unhandled event type: ${event.type}`);
    }
  }
  
  async handleNameTokenized(event) {
    console.log(`     🪙 New domain tokenized: ${event.name}`);
    // In a real app, you might:
    // - Create a record in your database
    // - Send a notification to the owner
    // - Initialize a landing page
  }
  
  async handleNameClaimed(event) {
    console.log(`     🎉 Domain claimed: ${event.name}`);
    // In a real app, you might:
    // - Update ownership records
    // - Send a welcome email
  }
  
  async handleNameTransferred(event) {
    console.log(`     🔄 Domain transferred: ${event.name}`);
    // In a real app, you might:
    // - Update ownership records
    // - Notify both parties
    // - Update marketplace listings
  }
  
  async handleNameListed(event) {
    console.log(`     🏷️ Domain listed: ${event.name}`);
    // In a real app, you might:
    // - Update marketplace listings
    // - Notify potential buyers
  }
  
  async handleNameOfferMade(event) {
    console.log(`     💰 Offer made: ${event.name}`);
    // In a real app, you might:
    // - Notify the seller
    // - Update offer records
  }
  
  async handleNamePurchased(event) {
    console.log(`     🛒 Domain purchased: ${event.name}`);
    // In a real app, you might:
    // - Update ownership records
    // - Transfer funds
    // - Send purchase confirmation
  }
  
  start(intervalMs = 30000) {
    if (this.isRunning) {
      console.log('⚠️  Polling service is already running');
      return;
    }
    
    this.isRunning = true;
    console.log(`🚀 Starting continuous polling service (interval: ${intervalMs}ms)`);
    
    // Run immediately
    this.pollEvents();
    
    // Set up interval
    this.pollingInterval = setInterval(() => {
      this.pollEvents();
    }, intervalMs);
  }
  
  stop() {
    if (!this.isRunning) {
      console.log('⚠️  Polling service is not running');
      return;
    }
    
    this.isRunning = false;
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    console.log('🛑 Stopped continuous polling service');
  }
  
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastProcessedEventId: this.lastProcessedEventId,
      pollingInterval: this.pollingInterval ? 'Active' : 'Inactive'
    };
  }
}

// Demo the continuous polling service
async function demoContinuousPolling() {
  console.log('🚀 Doma Continuous Polling Service Demo');
  console.log('========================================');
  
  const pollingService = new ContinuousPollingService();
  
  console.log('\n1. Starting polling service with 10-second interval...');
  pollingService.start(10000); // 10 seconds for demo purposes
  
  console.log('\n2. Service status:', pollingService.getStatus());
  
  console.log('\n3. Letting service run for 30 seconds...');
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  console.log('\n4. Stopping polling service...');
  pollingService.stop();
  
  console.log('\n5. Final service status:', pollingService.getStatus());
  
  console.log('\n🎯 Demo completed successfully!');
  console.log('\nIn a real application, you would:');
  console.log('  - Run this as a background service');
  console.log('  - Persist the last processed event ID to a database');
  console.log('  - Implement proper error handling and retries');
  console.log('  - Add monitoring and alerting');
  console.log('  - Scale horizontally for high event volumes');
}

// Run the demo if this script is executed directly
if (require.main === module) {
  demoContinuousPolling().catch(console.error);
}

// Export the class for use in other modules
module.exports = { ContinuousPollingService };