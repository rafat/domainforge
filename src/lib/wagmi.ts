// src/lib/wagmi.ts
import { createConfig, http } from 'wagmi'
import { domaTestnet } from './chains'
import { injected, walletConnect } from '@wagmi/connectors'

// Project ID for WalletConnect
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

export const wagmiConfig = createConfig({
  chains: [domaTestnet],
  connectors: [
    injected(),
    ...(projectId ? [walletConnect({ 
      projectId, 
      showQrModal: true 
    })] : []),
  ],
  transports: {
    [domaTestnet.id]: http(),
  },
})

// Export as both names for compatibility
export const config = wagmiConfig