# Enhanced Doma Subgraph API Integration

This document describes the enhancements made to the Doma Subgraph API integration in DomainForge.

## Overview

The enhancements focus on three main areas:
1. **Comprehensive Queries**: Added more detailed GraphQL queries to fetch richer domain data
2. **Pagination Support**: Implemented pagination for large datasets
3. **Caching Layer**: Added in-memory caching to improve performance

## Enhanced Methods

### 1. getToken(tokenId, useCache)
Enhanced to include more comprehensive domain information:
- Full activity history with transaction hashes and finalization status
- Detailed registrar information
- Complete listing data
- Enhanced token metadata

### 2. getNames(filters, useCache)
Enhanced with additional filtering options:
- `claimStatus`: Filter by claim status (CLAIMED, UNCLAIMED, ALL)
- `networkIds`: Filter by network IDs
- `registrarIanaIds`: Filter by registrar IANA IDs
- `sortOrder`: Sort results (ASC/DESC)
- Pagination support with `skip` and `take` parameters
- Enhanced domain data including nameservers, DS keys, and transfer lock status

### 3. getDomainByName(name, useCache)
Enhanced to include:
- Complete domain information with all tokens
- Nameserver and DNSSEC data
- Full activity history
- Enhanced registrar information

### 4. getDomainActivities(tokenId, type, limit, useCache)
Enhanced with:
- Pagination support
- Filtering by activity type
- Enhanced activity data with transaction details

### 5. New Methods

#### getDomainStatistics(tokenId, useCache)
Fetches domain statistics including:
- Highest offer information
- Active offers count
- Offers in the last 3 days

#### getPaginatedListings(filters, useCache)
Fetches paginated listings with comprehensive filtering:
- TLD filtering
- Date range filtering
- Network and registrar filtering
- Sorting options

#### getPaginatedOffers(filters, useCache)
Fetches paginated offers with comprehensive filtering:
- Offerer address filtering
- Status filtering (ACTIVE, EXPIRED, All)
- Sorting options

#### getNameActivities(name, filters, useCache)
Fetches activities for a specific domain name with pagination support.

## Caching Implementation

A simple in-memory cache has been implemented with the following features:
- Configurable TTL (Time To Live) for cache entries
- Automatic cleanup of expired entries
- Cache key generation based on query parameters
- Thread-safe operations

### Usage
```javascript
// Enable caching for any method by setting useCache parameter to true
const token = await domaApi.getToken('1', true); // with caching
const token2 = await domaApi.getToken('1', false); // without caching (default)
```

## Pagination Support

All methods that return lists now support pagination:
- `skip`: Number of items to skip
- `take`: Number of items to return (max 100)
- `sortOrder`: Sort order (ASC/DESC)
- Return object includes pagination metadata:
  - `totalCount`: Total number of items
  - `pageSize`: Number of items per page
  - `currentPage`: Current page number
  - `totalPages`: Total number of pages
  - `hasPreviousPage`: Whether there's a previous page
  - `hasNextPage`: Whether there's a next page

## Performance Improvements

1. **Reduced API Calls**: Caching reduces redundant API calls
2. **Efficient Data Fetching**: Pagination prevents fetching unnecessary data
3. **Better Error Handling**: Enhanced error messages and handling
4. **Consistent Response Format**: All paginated methods return consistent response structure

## Usage Examples

```javascript
// Get paginated domains with filtering
const domains = await domaApi.getNames({
  ownedBy: ['eip155:1:0x123...'],
  take: 20,
  skip: 0,
  sortOrder: 'DESC'
}, true); // with caching

// Get paginated listings with filtering
const listings = await domaApi.getPaginatedListings({
  tlds: ['eth', 'xyz'],
  take: 10,
  skip: 0,
  sortOrder: 'DESC'
}, true); // with caching

// Get domain statistics
const stats = await domaApi.getDomainStatistics('1', true); // with caching
```

## Testing

Test scripts have been created to verify the functionality:
- `test-enhanced-doma-api.js`: Tests all enhanced methods
- `test-doma-cache.js`: Tests caching functionality
- `test-cache-simple.js`: Simple cache test without TypeScript dependencies

## Future Improvements

1. **Persistent Caching**: Implement disk-based or Redis caching for production
2. **Cache Invalidation**: Add more sophisticated cache invalidation strategies
3. **Rate Limiting**: Implement rate limiting to prevent API abuse
4. **Retry Logic**: Add retry logic for failed API calls
5. **Batch Queries**: Implement batch GraphQL queries for better efficiency