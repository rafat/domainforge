// src/components/DebugWalletSwitcher.tsx
'use client'

import { useState } from 'react'

interface DebugWalletSwitcherProps {
  onAddressChange: (address: string) => void
}

export default function DebugWalletSwitcher({ onAddressChange }: DebugWalletSwitcherProps) {
  const [isVisible, setIsVisible] = useState(false)
  
  const testAddresses = [
    { name: 'Address 1 (3 domains)', address: '0x1234567890123456789012345678901234567890' },
    { name: 'Address 2 (1 domain)', address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' },
    { name: 'Address 3 (1 domain)', address: '0x9876543210987654321098765432109876543210' },
    { name: 'Your Current Address', address: '0x2EB8291d3a6b72cf55B000610B6485b68783D330' },
    { name: 'Empty Address', address: '0x0000000000000000000000000000000000000000' }
  ]

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg hover:bg-red-600"
      >
        🔧 Debug
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-64">
          <h3 className="font-semibold text-gray-900 mb-3">Test Wallet Addresses</h3>
          <div className="space-y-2">
            {testAddresses.map((addr) => (
              <button
                key={addr.address}
                onClick={() => onAddressChange(addr.address)}
                className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border"
              >
                <div className="font-medium">{addr.name}</div>
                <div className="text-xs text-gray-500 font-mono">
                  {addr.address.slice(0, 8)}...{addr.address.slice(-6)}
                </div>
              </button>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => setIsVisible(false)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}