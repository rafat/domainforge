# Blockchain Synchronization Solution

## Problem Statement

The main issue with DomainForge was that the database was not properly synchronized with the blockchain state. When users purchased domains directly on-chain (bypassing the app), the database continued to show those domains as listed for sale, leading to a poor user experience.

## Root Causes

1. **No Continuous Event Monitoring**: The application wasn't continuously monitoring blockchain events
2. **Missing Database Updates**: When blockchain events occurred, the database wasn't updated
3. **Incomplete Integration**: The polling service existed but wasn't properly integrated

## Solution Overview

The solution involves implementing a continuous synchronization mechanism that:

1. **Monitors Blockchain Events**: Regularly polls the Doma Protocol for relevant events
2. **Updates Database**: Automatically updates the database when events occur
3. **Handles All Relevant Events**: Processes events that affect domain ownership and listing status
4. **Robust Error Handling**: Implements retry mechanisms with exponential backoff

## Implementation Details

### 1. Enhanced DomaPollService

The `DomaPollService` was enhanced to properly handle all relevant events:

- **NAME_PURCHASED**: Updates ownership and clears listing status
- **NAME_TRANSFERRED**: Updates domain ownership
- **NAME_LISTED**: Updates listing status and price
- **NAME_CANCELLED**: Clears listing status
- **NAME_EXPIRED**: Clears listing status

### 2. Background Synchronization API

A new API endpoint `/api/doma/sync` was created that can be triggered periodically to:

- Poll for blockchain events
- Process events and update the database
- Acknowledge processed events

### 3. Authentication

The synchronization endpoint is protected with a bearer token authentication to prevent unauthorized access.

### 4. Error Handling and Retry Mechanisms

The service implements robust error handling with:

- **Retry with Exponential Backoff**: Failed operations are retried with increasing delays
- **Maximum Retry Limit**: Prevents infinite retry loops
- **Error Logging**: Failed operations are logged for debugging
- **Graceful Degradation**: Service continues to operate even if individual operations fail

## Event Handling Logic

### NAME_PURCHASED
When a domain is purchased:
- Update domain owner to the buyer
- Set `forSale` to false
- Clear `price` and `buyNowPrice`
- Mark all pending offers as expired
- Update `updatedAt` timestamp

### NAME_TRANSFERRED
When a domain is transferred:
- Update domain owner
- Update `updatedAt` timestamp

### NAME_LISTED
When a domain is listed:
- Set `forSale` to true
- Update `price` and `buyNowPrice`
- Update `updatedAt` timestamp

### NAME_CANCELLED / NAME_EXPIRED
When a listing is cancelled or expires:
- Set `forSale` to false
- Clear `price` and `buyNowPrice`
- Update `updatedAt` timestamp

## Deployment Instructions

1. Set up a cron job or scheduled task to call `/api/doma/sync` every 30 seconds
2. Ensure the `CRON_AUTH_TOKEN` environment variable is set
3. The synchronization service will automatically keep the database in sync with blockchain events

## Benefits

1. **Real-time Synchronization**: Database stays in sync with blockchain state
2. **Improved User Experience**: Users always see accurate domain status
3. **Prevents Confusion**: No more stale listings for purchased domains
4. **Automated**: No manual intervention required
5. **Robust**: Handles failures gracefully with retry mechanisms
6. **Reliable**: Exponential backoff prevents overwhelming the API