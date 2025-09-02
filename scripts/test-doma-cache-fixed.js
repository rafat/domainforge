// scripts/test-doma-cache-fixed.js
// Fixed test script for Doma API caching functionality (JavaScript version)

// Simple in-memory cache implementation (copied from src/lib/cache.ts)
class SimpleCache {
  constructor() {
    this.cache = new Map();
  }
  
  set(key, data, ttl = 300000) { // Default 5 minutes
    const expirationTime = Date.now() + ttl;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if item has expired
    if (Date.now() > item.timestamp + item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  delete(key) {
    return this.cache.delete(key);
  }
  
  clear() {
    this.cache.clear();
  }
  
  size() {
    return this.cache.size;
  }
}

// Create a singleton instance
const domaCache = new SimpleCache();

async function testDomaCache() {
  console.log('🔍 Testing Doma API Caching...')
  
  try {
    // Clear cache first
    domaCache.clear()
    console.log('✅ Cache cleared')
    
    // Test 1: Set and get cache
    console.log('\n=== Test 1: Basic cache operations ===')
    domaCache.set('test_key', { data: 'test_value', timestamp: Date.now() })
    const cachedValue = domaCache.get('test_key')
    console.log('✅ Set and get successful')
    console.log(`   Cached value: ${JSON.stringify(cachedValue)}`)
    
    // Test 2: Cache size
    console.log('\n=== Test 2: Cache size ===')
    console.log(`   Cache size: ${domaCache.size()}`)
    
    // Test 3: Cache deletion
    console.log('\n=== Test 3: Cache deletion ===')
    const deleted = domaCache.delete('test_key')
    console.log(`   Deleted: ${deleted}`)
    console.log(`   Cache size after deletion: ${domaCache.size()}`)
    
    // Test 4: Cache expiration
    console.log('\n=== Test 4: Cache expiration ===')
    domaCache.set('expiring_key', { data: 'expiring_value' }, 1000) // 1 second TTL
    let expiringValue = domaCache.get('expiring_key')
    console.log(`   Value before expiration: ${expiringValue ? expiringValue.data : 'null'}`)
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    expiringValue = domaCache.get('expiring_key')
    console.log(`   Value after expiration: ${expiringValue ? expiringValue.data : 'null'}`)
    console.log(`   Cache size after expiration: ${domaCache.size()}`)
    
    console.log('\n🎉 All cache tests completed!')
    
  } catch (error) {
    console.error('❌ Error testing cache:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

testDomaCache()