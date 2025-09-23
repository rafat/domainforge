// src/components/Navbar.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import ConnectWalletButton from './ConnectWalletButton'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-xl font-bold text-gray-900">DomainForge</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center space-x-8">
            <Link href="/marketplace" className="text-gray-600 hover:text-gray-900">
              Marketplace
            </Link>
            <Link href="/my-domains" className="text-gray-600 hover:text-gray-900">
              My Domains
            </Link>
            <ConnectWalletButton />
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1 border-t border-gray-200">
              <Link
                href="/marketplace"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Marketplace
              </Link>
              <Link
                href="/my-domains"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                My Domains
              </Link>
              <div className="px-3 py-2">
                <ConnectWalletButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
