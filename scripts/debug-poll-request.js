// scripts/debug-poll-request.js
// Debug script to understand the Poll API request format

async function debugPollRequest() {
  console.log('🔍 Debugging Poll API Request')
  console.log('============================')
  
  try {
    // Get API endpoints from environment variables
    const DOMA_API_URL = process.env.NEXT_PUBLIC_DOMA_API_URL || 'https://api-testnet.doma.xyz';
    const DOMA_API_KEY = process.env.DOMA_API_KEY;
    
    const https = require('https');
    
    function restRequest(endpoint, options = {}) {
      return new Promise((resolve, reject) => {
        const url = `${DOMA_API_URL}${endpoint}`;
        console.log(`Making request to: ${url}`);
        
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
        
        console.log('Request options:', requestOptions);
        
        const req = https.request(url, requestOptions, (res) => {
          console.log(`Response status: ${res.statusCode} ${res.statusMessage}`);
          
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            console.log('Response data:', data);
            
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
    
    console.log('\n1. Testing simple poll request...')
    
    // Test with a simple request
    const simpleResponse = await restRequest('/v1/poll?limit=2&finalizedOnly=true');
    console.log('Simple response:', simpleResponse);
    
    console.log('\n2. Testing with event types...')
    
    // Test with event types
    const params = new URLSearchParams();
    params.append('eventTypes', 'NAME_TOKENIZED');
    params.append('limit', '2');
    params.append('finalizedOnly', 'true');
    
    const typedResponse = await restRequest(`/v1/poll?${params.toString()}`);
    console.log('Typed response:', typedResponse);
    
  } catch (error) {
    console.error('❌ Error in debug:', error.message);
  }
}

debugPollRequest();