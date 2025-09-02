## XMTP Chat Enhancement Documentation

This document describes the enhancements made to the XMTP Chat functionality in DomainForge.

## Overview

The XMTP Chat has been enhanced with the following features:
1. **Offer Integration in Chat** - Connect OfferButton to Doma's Orderbook API
2. **Offer Status Tracking** - Real-time tracking using Poll API
3. **Real-time Notifications** - Notifications for offer updates
4. **System Messages** - Visual feedback for offer events
5. **Persistent Conversations** - Store conversations and messages in database for persistence
6. **Message History** - Retain conversation history across sessions
7. **Unread Tracking** - Track unread messages for better UX
8. **Message Synchronization** - Keep XMTP and database in sync
9. **Reliability Improvements** - Messages survive network interruptions

## Key Components

### 1. OfferButton Component (`src/components/chat/OfferButton.tsx`)

Enhanced with:
- **Doma Orderbook API Integration**: Creates offers using Doma's REST API
- **Offer Status Tracking**: Polls for offer status updates every 5 seconds
- **Visual Status Indicators**: Shows offer status (pending, submitted, accepted, etc.)
- **Offer ID Display**: Shows truncated offer ID for reference

### 2. ChatWidget Component (`src/components/chat/ChatWidget.tsx`)

Enhanced with:
- **Real-time Notifications**: Uses Poll API to receive offer events
- **Notification Badges**: Shows count of unread notifications
- **System Messages**: Displays event notifications in chat
- **Notification Management**: Clear notifications functionality
- **Persistent Conversations**: Stores messages in database for history retention
- **Message Deduplication**: Prevents duplicate messages from XMTP and database
- **Unread Tracking**: Tracks unread messages for better UX

### 3. OfferNotificationService (`src/lib/offerNotificationService.ts`)

New service for handling real-time offer notifications:
- **Poll API Integration**: Polls for offer-related events
- **Event Subscription**: Allows components to subscribe to domain-specific events
- **Event Handling**: Processes and distributes events to subscribers
- **Automatic Acknowledgment**: Acknowledges processed events

### 4. ChatPersistenceService (`src/lib/chatPersistenceService.ts`)

New service for handling persistent chat conversations:
- **Database Storage**: Stores conversations and messages in PostgreSQL
- **Conversation Management**: Creates and retrieves conversation records
- **Message Storage**: Saves and loads messages with metadata
- **Message Status Tracking**: Tracks delivered and read message status
- **Conversation History**: Retrieves conversation history for domains
- **Unread Count**: Tracks unread message counts for users

### 5. Enhanced XMTP Hook (`src/hooks/useXMTP.ts`)

Enhanced with persistence features:
- **Persistent Conversation Creation**: Creates XMTP conversation and database record
- **Message Persistence**: Saves sent and received messages to database
- **Message Loading**: Loads messages from both XMTP and database
- **Message Status Updates**: Updates message status in database

### 6. DomaService (`src/lib/doma.ts`)

Enhanced with:
- **Proper createOffer Implementation**: Creates offers using Doma's Orderbook API
- **Offer Parameter Preparation**: Prepares required parameters for offer creation

### 7. MessageList Component (`src/components/chat/MessageList.tsx`)

Enhanced with:
- **System Message Support**: Renders special system messages for events
- **Notification Styling**: Distinct styling for system notifications

## Technical Implementation

### Offer Creation Flow

1. User clicks "Make an Offer" in chat
2. OfferButton collects offer amount and message
3. DomaService.createOffer() prepares and sends offer to Doma's Orderbook API
4. Offer ID is returned and stored
5. Chat message is sent with offer details
6. Offer status is tracked with periodic polling

### Real-time Notification Flow

1. OfferNotificationService starts polling when chat is open
2. Poll API is queried for offer-related events
3. Events are processed and acknowledged
4. Subscribers (ChatWidget) receive event notifications
5. System messages are created and displayed in chat
6. Notification badges show unread event count

## API Integration

### Doma Orderbook API
- `createOffer()`: Creates new offers
- `getOffers()`: Retrieves existing offers for status checking

### Doma Poll API
- `pollEventsWithTypes()`: Polls for specific event types
- `acknowledgeEventWithResponse()`: Acknowledges processed events

## Usage Examples

### Creating an Offer
```javascript
// In OfferButton component
const response = await createOffer(domainId, amount)
const offerId = response?.id
```

### Subscribing to Offer Events
```javascript
// In ChatWidget component
const unsubscribe = offerNotificationService.subscribeToOfferEvents(
  domainId,
  handleOfferEvent
)
```

### Handling Offer Events
```javascript
const handleOfferEvent = (event) => {
  const systemMessage = {
    id: `system-${event.id}`,
    content: `New offer: ${event.data.amount} ETH`,
    sender: 'system',
    timestamp: new Date(event.timestamp),
    messageType: 'system'
  }
  setMessages(prev => [...prev, systemMessage])
}
```

## Testing

Test the enhancements with:
```bash
node scripts/test-xmtp-chat-enhancements.js
```

## Future Improvements

1. **Persistent Conversations**: Store chat history in database
2. **Advanced Offer Management**: Accept/reject offers from chat
3. **Enhanced Notifications**: Push notifications and email alerts
4. **Rich Offer Data**: Display offer details from Subgraph data
5. **Error Handling**: More robust error handling and retry logic