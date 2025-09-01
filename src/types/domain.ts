// src/types/domain.ts

import { DomaOffer } from './doma'

export interface DomainMetadata {
  name: string
  description: string
  image: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
}

export interface Template {
  id: string
  name: string
  preview: string
  description: string
  category: 'minimal' | 'modern' | 'corporate' | 'creative'
}
