// scripts/poll-api-demo.js
// Demonstration of Poll API integration in a real application scenario

async function runPollAPIDemo() {
  console.log('🚀 Doma Poll API Demo')
  console.log('====================')
  
  try {
    // Get API endpoints from environment variables
    const DOMA_API_URL = process.env.NEXT_PUBLIC_DOMA_API_URL || 'https://api-testnet.doma.xyz';
    const DOMA_API_KEY = process.env.DOMA_API_KEY;
    
    const https = require('https');
    
    function restRequest(endpoint, options = {}) {
      return new Promise((resolve, reject) => {
        const url = `${DOMA_API_URL}${endpoint}`;
        const defaultHeaders = {
          'Content-Type': 'application/json',
          'Api-Key': DOMA_API_KEY
        };
        
        const requestOptions = {
          ...options,
          headers: {
            ...defaultHeaders,
            ...options.headers
          }
        };
        
        const req = https.request(url, requestOptions, (res) => {
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
    
    console.log('\n1. Polling for domain events...')
    
    // Poll for events with correct parameter format (using what we know works)
    const eventsResponse = await restRequest(`/v1/poll?limit=5&finalizedOnly=true`);
    const events = eventsResponse.events || [];
    
    console.log(`   Found ${events.length} events`);
    
    if (events.length > 0) {
      console.log('\n2. Processing events...');
      
      for (const event of events) {
        console.log(`   Processing ${event.type} event for "${event.name}" (ID: ${event.id})`);
        
        // Handle different event types
        switch (event.type) {
          case 'NAME_TOKENIZED':
            console.log(`     🪙 New domain tokenized: ${event.name}`);
            // In a real app, you might:
            // - Create a record in your database
            // - Send a notification to the owner
            // - Initialize a landing page
            break;
            
          case 'NAME_CLAIMED':
            console.log(`     🎉 Domain claimed: ${event.name}`);
            // In a real app, you might:
            // - Update ownership records
            // - Send a welcome email
            break;
            
          case 'NAME_TRANSFERRED':
            console.log(`     🔄 Domain transferred: ${event.name}`);
            // In a real app, you might:
            // - Update ownership records
            // - Notify both parties
            // - Update marketplace listings
            break;
            
          default:
            console.log(`     ℹ️  Other event type: ${event.type}`);
        }
        
        // Acknowledge the event
        console.log(`   Acknowledging event ${event.id}...`);
        await restRequest(`/v1/poll/ack/${event.id}`, {
          method: 'POST'
        });
        console.log(`   ✅ Event ${event.id} acknowledged`);
      }
    } else {
      console.log('   No events to process');
    }
    
    console.log('\n3. Resetting polling position...');
    await restRequest(`/v1/poll/reset/0`, {
      method: 'POST'
    });
    console.log('   ✅ Polling reset to beginning');
    
    console.log('\n🎯 Demo completed successfully!')
    console.log('\nIn a real application, you would:')
    console.log('  - Run this in a scheduled job (e.g., every 30 seconds)')
    console.log('  - Persist the last processed event ID')
    console.log('  - Handle errors and retries appropriately')
    console.log('  - Scale processing based on event volume')
    
  } catch (error) {
    console.error('❌ Error in demo:', error.message);
  }
}

runPollAPIDemo();