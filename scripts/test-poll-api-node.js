// scripts/test-poll-api-node.js
// Node.js compatible test script for Poll API integration

const https = require('https');

// Get API endpoints from environment variables
const DOMA_API_URL = process.env.NEXT_PUBLIC_DOMA_API_URL || 'https://api-testnet.doma.xyz';
const DOMA_API_KEY = process.env.DOMA_API_KEY;

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

async function testPollAPI() {
  console.log('🔍 Testing Doma Poll API Integration...');
  
  try {
    // Test polling events
    console.log('\n🧪 Testing pollEvents method...');
    
    const params = new URLSearchParams();
    ['NAME_TOKENIZED', 'NAME_CLAIMED'].forEach(type => params.append('eventTypes', type));
    params.append('limit', '5');
    params.append('finalizedOnly', 'true');
    
    const events = await restRequest(`/v1/poll?${params.toString()}`);
    console.log('✅ pollEvents successful');
    console.log(`   Found ${events.events?.length || 0} events`);
    
    if (events.events && events.events.length > 0) {
      console.log('   Sample events:');
      events.events.slice(0, 3).forEach((event, index) => {
        console.log(`     ${index + 1}. ${event.type || 'Unknown'} - ID: ${event.id}`);
      });
      
      // Test acknowledging the last event
      console.log('\n🧪 Testing acknowledgeEvent method...');
      const lastEventId = events.events[events.events.length - 1].id;
      const ackResult = await restRequest(`/v1/poll/ack/${lastEventId}`, {
        method: 'POST'
      });
      console.log('✅ acknowledgeEvent successful');
      console.log(`   Acknowledged event ID: ${lastEventId}`);
      console.log(`   Response:`, ackResult);
    }
    
    // Test resetting polling (this requires EVENTS permission)
    console.log('\n🧪 Testing resetPolling method...');
    try {
      const resetResult = await restRequest(`/v1/poll/reset/0`, {
        method: 'POST'
      });
      console.log('✅ resetPolling successful');
      console.log(`   Response:`, resetResult);
    } catch (error) {
      console.log('⚠️  resetPolling failed (might be expected due to permissions)');
      console.log(`   Error: ${error.message}`);
    }
    
    console.log('\n🎉 All Poll API tests completed!');
    
  } catch (error) {
    console.error('❌ Error testing Poll API:', error.message);
  }
}

testPollAPI();