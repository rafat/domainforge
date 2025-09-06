# Supabase Chat Implementation

This document describes the implementation of real-time chat conversations for DomainForge using Supabase.

## Overview

The real-time chat feature enhances the chat system by:
1. Storing conversations and messages in a database for persistence
2. Providing conversation history across sessions
3. Tracking unread messages
4. Enabling real-time message synchronization using Supabase's Realtime service
5. Improving reliability and resilience to network interruptions

## Key Components

### 1. Database Schema (`prisma/schema.prisma`)

Added new models for chat persistence:
- `ChatConversation`: Stores conversation metadata
- `ChatMessage`: Stores individual messages with metadata
- `ChatMessageType`: Enum for message types (TEXT, OFFER, SYSTEM)

### 2. ChatPersistenceService (`src/lib/chatPersistenceService.ts`)

New service for handling database operations:
- Creates/retrieves conversation records
- Saves messages to database
- Loads messages from database
- Marks messages as delivered/read
- Gets conversation history
- Tracks unread message counts

### 3. useRealtimeChat Hook (`src/hooks/useRealTimeChat.ts`)

Custom React hook for handling real-time chat conversations:
- Creates or joins conversation rooms
- Fetches historical messages
- Subscribes to new messages in real-time using Supabase's listener
- Sends new messages via secure backend API

### 4. ChatWidget Component (`src/components/chat/ChatWidget.tsx`)

Updated chat widget with real-time features:
- Combines messages from database with real-time updates
- Deduplicates messages
- Tracks unread message counts
- Persists conversation state

## Implementation Details

### Conversation Creation Flow

1. User initiates chat with domain owner
2. Conversation "room" is created or retrieved via API
3. Existing messages are loaded from database
4. Real-time subscription is established using Supabase channels

### Message Sending Flow

1. User sends message through chat interface
2. Message is sent to secure backend API
3. Message is saved to database
4. Supabase's Realtime service broadcasts the new message
5. All connected clients receive the message in real-time

### Message Receiving Flow

1. New messages are inserted into the database via API
2. Supabase's Realtime service notifies all subscribed clients
3. Messages appear in chat UI in real-time
4. Message status (delivered/read) is tracked

### Real-time Features

1. **Conversation History**: Messages persist across browser sessions
2. **Message Deduplication**: Prevents duplicate messages
3. **Unread Tracking**: Tracks unread messages for better UX
4. **Reliability**: Messages survive network interruptions
5. **Synchronization**: Keeps all clients in sync

## Database Schema

### ChatConversation Model
```
model ChatConversation {
  id                  String     @id @default(cuid())
  domainId           String
  domain             Domain     @relation(fields: [domainId], references: [id])
  buyerAddress       String
  sellerAddress      String
  xmtpConversationId String     @unique  // Legacy field name, now used for conversation identification
  lastMessageAt      DateTime?
  createdAt          DateTime   @default(now())
  updatedAt          DateTime   @updatedAt
  messages           ChatMessage[]
}
```

### ChatMessage Model
```
model ChatMessage {
  id              String       @id @default(cuid())
  conversationId String
  conversation   ChatConversation @relation(fields: [conversationId], references: [id])
  senderAddress  String
  content        String
  messageType    String       @default("text")
  xmtpMessageId String?      @unique  // Legacy field name, now used for message identification
  sentAt         DateTime     @default(now())
  deliveredAt    DateTime?
  readAt         DateTime?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}
```

## API Integration

The real-time chat system integrates with:
- **Supabase**: For real-time message broadcasting
- **Database**: For message persistence
- **Doma API**: For domain-related context

## Benefits

1. **Improved Reliability**: Messages persist through network issues
2. **Better UX**: Conversation history available across sessions
3. **Enhanced Features**: Unread tracking, message status
4. **Scalability**: Efficient database indexing and querying
5. **Flexibility**: Support for different message types

## Testing

The implementation can be tested by:
1. Running database migrations
2. Checking database schema creation
3. Verifying service method availability
4. Testing component compilation

## Future Improvements

1. **Message Search**: Enable searching through conversation history
2. **Message Attachments**: Support for file/image attachments
3. **Push Notifications**: Browser/system notifications for new messages
4. **Message Encryption**: End-to-end encryption for database storage
5. **Offline Support**: Full offline messaging capability