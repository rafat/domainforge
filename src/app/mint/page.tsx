// src/app/mint/page.tsx
'use client'

import { useState } from 'react'
import { useWallet } from '@/hooks/useWallet'
import LoadingSpinner from '@/components/LoadingSpinner'

const DOMAIN_EXTENSIONS = ['.doma', '.web3', '.chain', '.nft']

export default function MintPage() {
  const { address, isConnected } = useWallet()
  const [domainName, setDomainName] = useState('')
  const [selectedExtension, setSelectedExtension] = useState('.doma')
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(false)
  const [minting, setMinting] = useState(false)
  const [mintingTxHash, setMintingTxHash] = useState('')
  const [years, setYears] = useState(1)

  const fullDomainName = `${domainName}${selectedExtension}`
  const basePrice = calculatePrice(domainName.length)
  const totalPrice = basePrice * years

  function calculatePrice(length: number): number {
    if (length <= 3) return 5.0
    if (length === 4) return 2.0
    if (length === 5) return 1.0
    return 0.5
  }

  const checkAvailability = async () => {
    if (!domainName.trim()) return

    setChecking(true)
    setIsAvailable(null)

    try {
      const response = await fetch(`/api/domains/check?name=${encodeURIComponent(fullDomainName)}`)
      const data = await response.json()
      setIsAvailable(data.available)
    } catch (error) {
      console.error('Failed to check availability:', error)
    } finally {
      setChecking(false)
    }
  }

  const handleMint = async () => {
    if (!isConnected || !isAvailable || !domainName.trim()) return

    setMinting(true)
    setMintingTxHash('')

    try {
      const response = await fetch('/api/domains/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullDomainName,
          owner: address,
          years: years,
          amount: totalPrice,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMintingTxHash(data.txHash)
        // Reset form
        setDomainName('')
        setIsAvailable(null)
      } else {
        throw new Error(data.error || 'Failed to mint domain')
      }
    } catch (error) {
      console.error('Failed to mint domain:', error)
      alert('Failed to mint domain. Please try again.')
    } finally {
      setMinting(false)
    }
  }

  const isValidDomainName = (name: string) => {
    return /^[a-zA-Z0-9-]+$/.test(name) && name.length >= 3 && name.length <= 63
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Mint Your Domain</h1>
          <p className="text-gray-600">
            Secure your digital identity with a decentralized domain name
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Domain Input */}
          <div className="mb-6">
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
              Domain Name
            </label>
            <div className="flex">
              <input
                id="domain"
                type="text"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value.toLowerCase())}
                placeholder="Enter domain name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={selectedExtension}
                onChange={(e) => setSelectedExtension(e.target.value)}
                className="px-3 py-2 border-t border-r border-b border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {DOMAIN_EXTENSIONS.map(ext => (
                  <option key={ext} value={ext}>{ext}</option>
                ))}
              </select>
            </div>
            {domainName && !isValidDomainName(domainName) && (
              <p className="mt-1 text-sm text-red-600">
                Domain name can only contain letters, numbers, and hyphens (3-63 characters)
              </p>
            )}
          </div>

          {/* Registration Period */}
          <div className="mb-6">
            <label htmlFor="years" className="block text-sm font-medium text-gray-700 mb-2">
              Registration Period
            </label>
            <select
              id="years"
              value={years}
              onChange={(e) => setYears(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5].map(year => (
                <option key={year} value={year}>
                  {year} year{year > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Check Availability Button */}
          <div className="mb-6">
            <button
              onClick={checkAvailability}
              disabled={!domainName.trim() || !isValidDomainName(domainName) || checking}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {checking ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Checking...</span>
                </>
              ) : (
                'Check Availability'
              )}
            </button>
          </div>

          {/* Availability Result */}
          {isAvailable !== null && (
            <div className={`mb-6 p-4 rounded-md ${isAvailable ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className={`flex items-center ${isAvailable ? 'text-green-800' : 'text-red-800'}`}>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  {isAvailable ? (
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  )}
                </svg>
                <span className="font-medium">
                  {fullDomainName} is {isAvailable ? 'available' : 'not available'}
                </span>
              </div>
              {!isAvailable && (
                <p className="mt-1 text-sm text-red-700">
                  This domain is already registered. Try a different name.
                </p>
              )}
            </div>
          )}

          {/* Pricing Info */}
          {isAvailable && (
            <div className="mb-6 bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-gray-900 mb-3">Pricing Details</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Base price ({domainName.length} characters):</span>
                  <span>{basePrice} ETH/year</span>
                </div>
                <div className="flex justify-between">
                  <span>Registration period:</span>
                  <span>{years} year{years > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between font-medium text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total cost:</span>
                  <span>{totalPrice} ETH</span>
                </div>
              </div>
            </div>
          )}

          {/* Mint Button */}
          {isAvailable && (
            <div className="mb-6">
              {!isConnected ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">Connect your wallet to mint this domain</p>
                  <button className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700">
                    Connect Wallet
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleMint}
                  disabled={minting}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg font-medium"
                >
                  {minting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Minting...</span>
                    </>
                  ) : (
                    `Mint ${fullDomainName} for ${totalPrice} ETH`
                  )}
                </button>
              )}
            </div>
          )}

          {/* Success Message */}
          {mintingTxHash && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-md">
              <div className="flex items-center text-green-800">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Domain minted successfully!</span>
              </div>
              <p className="mt-2 text-sm text-green-700">
                Transaction hash: 
                <a 
                  href={`https://etherscan.io/tx/${mintingTxHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 underline hover:text-green-900"
                >
                  {mintingTxHash.slice(0, 10)}...{mintingTxHash.slice(-8)}
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Pricing Information */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">3 characters:</span>
                <span className="font-medium">5 ETH/year</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">4 characters:</span>
                <span className="font-medium">2 ETH/year</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">5 characters:</span>
                <span className="font-medium">1 ETH/year</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">6+ characters:</span>
                <span className="font-medium">0.5 ETH/year</span>
              </div>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• Domains are renewable at any time</p>
              <p>• No renewal fees for first year</p>
              <p>• Transfer ownership anytime</p>
              <p>• Set up redirects and subdomains</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
