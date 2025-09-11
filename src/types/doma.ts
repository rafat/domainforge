export interface DomaDomain {
  id: string
  name: string
  tokenId: string
  tokenAddress: string
  owner: string
  contractAddress: string
  chainId: number
  registrationDate: Date
  expiry: Date | null
  title: string | null
  description: string | null
  template: string
  customCSS: string | null
  isActive: boolean
  screenshot: string | null
  metaTitle: string | null
  metaDescription: string | null
  buyNowPrice: string | null
  acceptOffers: boolean
  createdAt: Date
  updatedAt: Date
  views: number
  forSale: boolean
  price: string | null
  records: DnsRecord[]
  offers: DomaOffer[]
}

export interface DnsRecord {
  id: string
  type: string
  name: string
  value: string
  ttl: number
  priority: number | null
  createdAt: Date
  updatedAt: Date
}

export interface CurrencyModel {
  name: string;
  symbol: string;
  decimals: number;
}

export type OrderbookType = 'DOMA' | 'OPENSEA';

export interface DomaOffer {
  id: string;
  externalId: string;
  price: string; // BigInt in Doma.md, but represented as string in JS
  offererAddress: string;
  orderbook: OrderbookType;
  currency: CurrencyModel;
  expiresAt: Date;
  createdAt: Date;
  // These are from the Prisma model, might not be directly from Doma API
  domainId?: string;
  buyer?: string;
  amount?: string;
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  txHash?: string;
  blockNumber?: number;
  updatedAt?: Date;
}

export interface DomaListing {
  id: string;
  externalId: string;
  price: string; // BigInt in Doma.md, but represented as string in JS
  offererAddress: string;
  orderbook: OrderbookType;
  currency: CurrencyModel;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OwnershipHistory {
  tokenId: string
  from: string
  to: string
  price?: string
  timestamp: Date
  txHash: string
  blockNumber: number
}
