// src/lib/wagmi.ts
import { createConfig, http } from 'wagmi'
import { domaTestnet } from './chains'
import { injected, walletConnect } from '@wagmi/connectors'

// Project ID for WalletConnect (you'll need to get one from walletconnect.com)
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID'

export const config = createConfig({
  chains: [domaTestnet],
  connectors: [
    injected(),
    walletConnect({
      projectId,
      showQrModal: true,
    }),
  ],
  transports: {
    [domaTestnet.id]: http(),
  },
})