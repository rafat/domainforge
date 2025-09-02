// src/types/domaEvents.ts
export interface DomaEvent {
  id: number
  type: string
  timestamp: string
  data: any
  finalized: boolean
}

export interface PollEventsResponse {
  events: DomaEvent[]
  hasMore: boolean
  nextCursor?: string
}

export interface AcknowledgeEventResponse {
  success: boolean
  message: string
}

export interface ResetPollingResponse {
  success: boolean
  message: string
}

// Common Doma event types
export type DomaEventType = 
  | 'NAME_TOKENIZED'
  | 'NAME_CLAIMED'
  | 'NAME_TRANSFERRED'
  | 'NAME_LISTED'
  | 'NAME_OFFER_MADE'
  | 'NAME_PURCHASED'
  | 'NAME_CANCELLED'
  | 'NAME_EXPIRED'
  | string // Allow for custom event types

// Specific event data types
export interface NameTokenizedData {
  tokenId: string
  owner: string
  name: string
  registrar: string
  timestamp: string
}

export interface NameTransferredData {
  tokenId: string
  previousOwner: string
  newOwner: string
  timestamp: string
}

export interface NameListedData {
  tokenId: string
  seller: string
  price: string
  currency: string
  orderId: string
  timestamp: string
}

export interface NameOfferMadeData {
  tokenId: string
  buyer: string
  amount: string
  currency: string
  orderId: string
  expiry: string
  timestamp: string
}

export interface NamePurchasedData {
  tokenId: string
  buyer: string
  seller: string
  price: string
  currency: string
  orderId: string
  timestamp: string
}

export interface NameCancelledData {
  tokenId: string
  orderId: string
  reason: string
  timestamp: string
}

export interface NameExpiredData {
  tokenId: string
  name: string
  timestamp: string
}