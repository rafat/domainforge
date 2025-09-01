// scripts/test-poll-api.js
// Test script for Poll API integration

async function testPollAPI() {
  console.log('🔍 Testing Doma Poll API Integration...')
  
  try {
    // Dynamically import the Doma API client
    const domaApiModule = await import('../src/lib/domaApi.ts')
    const { domaApi } = domaApiModule
    
    // Test polling events
    console.log('\n🧪 Testing pollEvents method...')
    const events = await domaApi.pollEvents(['NAME_TOKENIZED', 'NAME_CLAIMED'], 5, true)
    console.log('✅ pollEvents successful')
    console.log(`   Found ${events.events?.length || 0} events`)
    
    if (events.events && events.events.length > 0) {
      console.log('   Sample events:')
      events.events.slice(0, 3).forEach((event, index) => {
        console.log(`     ${index + 1}. ${event.type || 'Unknown'} - ID: ${event.id}`)
      })
      
      // Test acknowledging the last event
      console.log('\n🧪 Testing acknowledgeEvent method...')
      const lastEventId = events.events[events.events.length - 1].id
      await domaApi.acknowledgeEvent(lastEventId)
      console.log('✅ acknowledgeEvent successful')
      console.log(`   Acknowledged event ID: ${lastEventId}`)
    }
    
    // Test resetting polling (this requires EVENTS permission)
    console.log('\n🧪 Testing resetPolling method...')
    try {
      await domaApi.resetPolling(0)
      console.log('✅ resetPolling successful')
    } catch (error) {
      console.log('⚠️  resetPolling failed (might be expected due to permissions)')
      console.log(`   Error: ${error.message}`)
    }
    
    console.log('\n🎉 All Poll API tests completed!')
    
  } catch (error) {
    console.error('❌ Error testing Poll API:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

testPollAPI()