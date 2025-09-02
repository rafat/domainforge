# XMTP Chat Persistent Conversations Implementation

This document describes the implementation of persistent conversations for the XMTP chat system in DomainForge.

## Overview

The persistent conversation feature enhances the XMTP chat system by:
1. Storing conversations and messages in a database for persistence
2. Providing conversation history across sessions
3. Tracking unread messages
4. Enabling message synchronization between XMTP and local storage
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

### 3. Enhanced XMTP Hook (`src/hooks/useXMTP.ts`)

Extended with persistence features:
- `createConversation`: Creates XMTP conversation and persistent record
- `sendMessage`: Sends XMTP message and saves to database
- `streamMessages`: Streams XMTP messages and saves incoming messages
- `loadPersistentMessages`: Loads messages from database
- `markMessagesAsRead`: Marks messages as read in database

### 4. Enhanced ChatWidget (`src/components/chat/ChatWidget.tsx`)

Updated with persistent conversation features:
- Combines XMTP messages with database messages
- Deduplicates messages
- Tracks unread message counts
- Persists conversation state

## Implementation Details

### Conversation Creation Flow

1. User initiates chat with domain owner
2. XMTP conversation is created using `createConversation`
3. Database record is created for persistent storage
4. Existing messages are loaded from both XMTP and database
5. Messages are deduplicated and sorted chronologically

### Message Sending Flow

1. User sends message through chat interface
2. Message is sent via XMTP using `sendMessage`
3. Message is simultaneously saved to database
4. Message appears in chat UI via XMTP stream

### Message Receiving Flow

1. Incoming messages are streamed via XMTP
2. Messages are saved to database as they arrive
3. Messages appear in chat UI in real-time
4. Message status (delivered/read) is tracked

### Persistence Features

1. **Conversation History**: Messages persist across browser sessions
2. **Message Deduplication**: Prevents duplicate messages from XMTP and database
3. **Unread Tracking**: Tracks unread messages for better UX
4. **Reliability**: Messages survive network interruptions
5. **Synchronization**: Keeps XMTP and database in sync

## Database Schema

### ChatConversation Model
```
model ChatConversation {
  id                  String     @id @default(cuid())
  domainId           String
  domain             Domain     @relation(fields: [domainId], references: [id])
  buyerAddress       String
  sellerAddress      String
  xmtpConversationId String     @unique
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
  xmtpMessageId String?      @unique
  sentAt         DateTime     @default(now())
  deliveredAt    DateTime?
  readAt         DateTime?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}
```

## API Integration

The persistent chat system integrates with:
- **XMTP**: For real-time messaging
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