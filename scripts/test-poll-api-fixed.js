// scripts/test-poll-api-fixed.js
// Fixed test script for Poll API integration that works with Node.js

async function testPollAPI() {
  console.log('🔍 Testing Doma Poll API Integration...')
  
  try {
    // Instead of importing TypeScript directly, we'll use the API through our Next.js app
    // This simulates how the application would actually use the API
    
    console.log('\n🧪 Testing direct REST API calls to Poll API...')
    
    // Get the API key from environment
    const apiKey = process.env.DOMA_API_KEY || 'v1.xxxx';
    const apiUrl = 'https://api-testnet.doma.xyz';
    
    // Test polling events
    console.log('\n🧪 Testing poll events endpoint...')
    const pollParams = new URLSearchParams({
      limit: '5',
      finalizedOnly: 'true'
    });
    
    const pollResponse = await fetch(`${apiUrl}/v1/poll?${pollParams.toString()}`, {
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (pollResponse.ok) {
      const pollData = await pollResponse.json();
      console.log('✅ Poll API call successful');
      console.log(`   Found ${pollData.events?.length || 0} events`);
      
      if (pollData.events && pollData.events.length > 0) {
        console.log('   Sample events:');
        pollData.events.slice(0, 3).forEach((event, index) => {
          console.log(`     ${index + 1}. ${event.type || 'Unknown'} - ID: ${event.id}`);
        });
        
        // Test acknowledging the last event
        console.log('\n🧪 Testing acknowledge event endpoint...');
        const lastEventId = pollData.events[pollData.events.length - 1].id;
        const ackResponse = await fetch(`${apiUrl}/v1/poll/ack/${lastEventId}`, {
          method: 'POST',
          headers: {
            'Api-Key': apiKey,
            'Content-Type': 'application/json'
          }
        });
        
        if (ackResponse.ok || ackResponse.status === 200) {
          console.log('✅ Acknowledge event successful');
          console.log(`   Acknowledged event ID: ${lastEventId}`);
        } else {
          console.log('⚠️  Acknowledge event failed');
          console.log(`   Status: ${ackResponse.status}`);
        }
      }
    } else {
      console.log('⚠️  Poll API call failed');
      console.log(`   Status: ${pollResponse.status}`);
      console.log(`   Status text: ${pollResponse.statusText}`);
    }
    
    console.log('\n🎉 Poll API test completed!');
    
  } catch (error) {
    console.error('❌ Error testing Poll API:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testPollAPI();