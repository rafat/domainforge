// src/lib/chains.ts
import { defineChain } from 'viem'

export const domaTestnet = defineChain({
  id: 97476,
  name: 'Doma Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.doma.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Doma Explorer',
      url: 'https://explorer-testnet.doma.xyz',
    },
  },
  testnet: true,
})