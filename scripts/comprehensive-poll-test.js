// scripts/comprehensive-poll-test.js
// Comprehensive test for Poll API integration

async function runComprehensiveTest() {
  console.log('🔍 Running comprehensive Doma Poll API test...')
  
  try {
    // Get API endpoints from environment variables
    const DOMA_API_URL = process.env.NEXT_PUBLIC_DOMA_API_URL || 'https://api-testnet.doma.xyz';
    const DOMA_API_KEY = process.env.DOMA_API_KEY ;
    
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
    
    // Test 1: Basic polling
    console.log('\n=== Test 1: Basic Polling ===');
    const params1 = new URLSearchParams();
    ['NAME_TOKENIZED'].forEach(type => params1.append('eventTypes', type));
    params1.append('limit', '3');
    params1.append('finalizedOnly', 'true');
    const events = await restRequest(`/v1/poll?${params1.toString()}`);
    console.log(`✅ Found ${events.events?.length || 0} events`);
    
    // Test 2: Polling with multiple event types
    console.log('\n=== Test 2: Polling with Multiple Event Types ===');
    const params2 = new URLSearchParams();
    ['NAME_TOKENIZED', 'NAME_CLAIMED'].forEach(type => params2.append('eventTypes', type));
    params2.append('limit', '2');
    params2.append('finalizedOnly', 'true');
    const typedEvents = await restRequest(`/v1/poll?${params2.toString()}`);
    console.log(`✅ Found ${typedEvents.events?.length || 0} events with multiple types`);
    
    // Test 3: Event acknowledgment
    console.log('\n=== Test 3: Event Acknowledgment ===');
    if (typedEvents.events && typedEvents.events.length > 0) {
      const eventId = typedEvents.events[0].id;
      const ackResult = await restRequest(`/v1/poll/ack/${eventId}`, {
        method: 'POST'
      });
      console.log(`✅ Acknowledged event ${eventId}:`, ackResult || 'Empty response (success)');
    }
    
    // Test 4: Reset polling
    console.log('\n=== Test 4: Reset Polling ===');
    const resetResult = await restRequest(`/v1/poll/reset/0`, {
      method: 'POST'
    });
    console.log('✅ Reset polling result:', resetResult || 'Empty response (success)');
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during comprehensive test:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

runComprehensiveTest();