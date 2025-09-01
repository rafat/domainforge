// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { DomaDomain as Domain } from '@/types/doma'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatPrice(price: string | number, currency = 'ETH'): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return `${numPrice.toFixed(4)} ${currency}`
}

export function timeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

export function generateSEOMetadata(domain: Domain) {
  const title = domain.metaTitle || `${domain.name} - Premium Domain For Sale`
  const description = domain.metaDescription || 
    `${domain.name} is a premium domain available for purchase. ${domain.description || ''}`
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: domain.screenshot ? [domain.screenshot] : []
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: domain.screenshot ? [domain.screenshot] : []
    }
  }
}
