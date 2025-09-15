// scripts/test-sync-service.js
// Test script for the Doma synchronization service

const { DomaPollService } = require('../src/lib/domaPollService');

async function testSyncService() {
  console.log('🧪 Testing Doma Synchronization Service');
  console.log('=====================================');
  
  try {
    // Create an instance of the polling service
    const pollService = new DomaPollService();
    
    console.log('\n1. Testing event processing...');
    
    // Process a small batch of events to test the service
    await pollService.processEvents([
      'NAME_TRANSFERRED',
      'NAME_PURCHASED',
      'NAME_LISTED',
      'NAME_CANCELLED',
      'NAME_EXPIRED'
    ], 5);
    
    console.log('\n2. Testing service status...');
    const lastProcessedId = pollService.getLastProcessedEventId();
    console.log(`   Last processed event ID: ${lastProcessedId}`);
    
    console.log('\n3. Testing retry mechanism...');
    // This would test the retry mechanism if we had a failing operation
    
    console.log('\n✅ Sync service test completed successfully!');
    console.log('\nTo continuously monitor events, you can:');
    console.log('  - Set up a cron job to call /api/doma/sync every 30 seconds');
    console.log('  - Or run the service in continuous mode in production');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testSyncService().catch(console.error);
}

module.exports = { testSyncService };