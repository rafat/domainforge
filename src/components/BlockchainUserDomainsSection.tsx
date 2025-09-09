// src/components/BlockchainUserDomainsSection.tsx
'use client'

import { useState, useEffect } from 'react'
import { useDomaBlockchainDomains } from '@/hooks/useDomaBlockchainDomains'
import ConnectWalletButton from '@/components/ConnectWalletButton'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useWalletClient, usePublicClient, useSignMessage } from 'wagmi'
import { domaApi } from '@/lib/domaApi'
import { formatTokenIdDisplay } from '@/utils/tokenIdUtils'

interface DomaTokenModel {
  tokenId: string
  networkId: string
  ownerAddress: string
  type: 'OWNERSHIP' | 'SYNTHETIC'
  startsAt?: string
  expiresAt: string
  explorerUrl: string
  tokenAddress: string
  createdAt: string
  chain: {
    name: string
    networkId: string
  }
}

interface DomaNameModel {
  name: string
  expiresAt: string
  tokenizedAt: string
  eoi: boolean
  registrar: {
    name: string
    ianaId: string
    websiteUrl?: string
    supportEmail?: string
  }
  nameservers: Array<{
    ldhName: string
  }>
  dsKeys: Array<{
    keyTag: number
    algorithm: number
    digest: string
    digestType: number
  }>
  transferLock?: boolean
  claimedBy?: string
  tokens: DomaTokenModel[]
}

interface BlockchainUserDomainsSectionProps {
  debugAddress?: string
}

// Utility function to copy text to clipboard with feedback
function copyToClipboard(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      // Could add toast notification here
      console.log('Copied to clipboard:', text)
    })
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
      console.log('Copied to clipboard:', text)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
    document.body.removeChild(textArea)
  }
}

function DomainBlockchainCard({ domain }: { domain: DomaNameModel }) {
  const isExpired = new Date(domain.expiresAt) < new Date()
  const isClaimed = !!domain.claimedBy
  
  // Get the owner address from the first token
  const ownerAddress = domain.tokens && domain.tokens.length > 0 ? domain.tokens[0].ownerAddress : ''
  
  // Get the token ID from the first token
  const tokenId = domain.tokens && domain.tokens.length > 0 ? domain.tokens[0].tokenId : ''
  
  // Get the chain information
  const chainInfo = domain.tokens && domain.tokens.length > 0 ? domain.tokens[0].chain : null
  
  // Wallet hooks
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { signMessageAsync } = useSignMessage()
  // Removed direct DomaService instantiation to use API routes instead
  
  // State for listing management
  const [isListing, setIsListing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [listingPrice, setListingPrice] = useState('')
  const [existingListingId, setExistingListingId] = useState('')
  const [domainListings, setDomainListings] = useState<any[]>([])
  const [loadingListings, setLoadingListings] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Fetch existing listings for this domain
  useEffect(() => {
    const fetchDomainListings = async () => {
      if (!isMounted || !tokenId) return
      
      setLoadingListings(true)
      try {
        const data = await domaApi.getListings(tokenId)
        const listings = data.listings || []
        setDomainListings(listings)
        
        if (listings.length > 0) {
          const activeListing = listings[0]
          setExistingListingId(activeListing.externalId || activeListing.id)
          setListingPrice(activeListing.price)
        } else {
          setExistingListingId('')
          setListingPrice('')
        }
      } catch (error) {
        console.error('Failed to fetch domain listings:', error)
      } finally {
        setLoadingListings(false)
      }
    }
    
    fetchDomainListings()
  }, [isMounted, tokenId])
  
  // Handle listing a domain for sale
  const handleListDomain = async () => {
    if (!tokenId || !listingPrice || !walletClient) return
    
    setIsListing(true)
    try {
      // Create parameters object for the listing
      const parameters = {
        tokenId,
        price: listingPrice,
        sellerAddress: walletClient.account.address,
        chainId: 'eip155:97476', // Doma testnet chain ID
        // Add other required parameters as needed based on the API
      }
      
      // Create a message to sign that represents the listing parameters
      const messageToSign = `List domain ${tokenId} for ${listingPrice} ETH on Doma Protocol`
      
      // Sign the message with the wallet
      const signature = await signMessageAsync({ message: messageToSign })
      
      await domaApi.createListing(parameters, signature)
      alert('Domain listed successfully!')
      
      // Refresh listings
      const data = await domaApi.getListings(tokenId)
      setDomainListings(data.listings || [])
    } catch (error: any) {
      console.error('Failed to list domain:', error)
      alert(`Failed to list domain: ${error.message}`)
    } finally {
      setIsListing(false)
    }
  }
  
  // Handle updating a listing
  const handleUpdateListing = async () => {
    if (!tokenId || !listingPrice || !walletClient || !existingListingId) return
    
    setIsUpdating(true)
    try {
      // Create a message to sign for the update action
      const messageToSign = `Update listing ${existingListingId} for domain ${tokenId} to ${listingPrice} ETH on Doma Protocol`
      
      // Sign the message with the wallet
      const signature = await signMessageAsync({ message: messageToSign })
      
      // Include the signature in the update call
      await domaApi.updateListing(existingListingId, tokenId, listingPrice, walletClient.account.address, signature)
      alert('Listing updated successfully!')
      
      // Refresh listings
      const data = await domaApi.getListings(tokenId)
      setDomainListings(data.listings || [])
    } catch (error: any) {
      console.error('Failed to update listing:', error)
      alert(`Failed to update listing: ${error.message}`)
    } finally {
      setIsUpdating(false)
    }
  }
  
  // Handle canceling a listing
  const handleCancelListing = async () => {
    if (!existingListingId || !walletClient) return
    
    setIsCanceling(true)
    try {
      // Create a message to sign for the cancel action
      const messageToSign = `Cancel listing ${existingListingId} on Doma Protocol`
      
      // Sign the message with the wallet
      const signature = await signMessageAsync({ message: messageToSign })
      
      // Include the signature in the cancel call
      await domaApi.cancelListing(existingListingId, walletClient.account.address, signature)
      alert('Listing canceled successfully!')
      
      // Clear listing state
      setDomainListings([])
      setExistingListingId('')
      setListingPrice('')
    } catch (error: any) {
      console.error('Failed to cancel listing:', error)
      alert(`Failed to cancel listing: ${error.message}`)
    } finally {
      setIsCanceling(false)
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 h-fit">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 mb-2 break-words">
              {domain.name}
            </h3>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isClaimed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {isClaimed ? 'Claimed' : 'Unclaimed'}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isExpired ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {isExpired ? 'Expired' : 'Active'}
              </span>
              {domain.eoi && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  EOI
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3 text-sm text-gray-600 overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="font-medium flex-shrink-0">Expires:</span>
            <span className="text-right">{new Date(domain.expiresAt).toLocaleDateString()}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium flex-shrink-0">Tokenized:</span>
            <span className="text-right">{new Date(domain.tokenizedAt).toLocaleDateString()}</span>
          </div>
          
          <div className="flex justify-between items-start">
            <span className="font-medium flex-shrink-0">Registrar:</span>
            <span className="text-right break-words">{domain.registrar.name}</span>
          </div>

          {domain.tokens.length > 0 && (
            <div className="border-t pt-3">
              <div className="font-medium mb-2">Tokens ({domain.tokens.length}):</div>
              {domain.tokens.map((token, index) => (
                <div key={token.tokenId} className="ml-4 text-xs space-y-1 mb-3 last:mb-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="block font-medium text-gray-700">Token ID:</span>
                      <button
                        onClick={() => copyToClipboard(token.tokenId)}
                        className="block text-xs text-gray-500 break-all hover:text-blue-600 transition-colors cursor-pointer text-left"
                        title={`Click to copy: ${token.tokenId}`}
                      >
                        {formatTokenIdDisplay(token.tokenId)}
                      </button>
                    </div>
                    <span className="text-blue-600 font-medium flex-shrink-0">{token.chain.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Type:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      token.type === 'OWNERSHIP' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {token.type}
                    </span>
                  </div>
                  {token.explorerUrl && (
                    <div className="mt-2">
                      <a 
                        href={token.explorerUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-xs"
                      >
                        View on Explorer →
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {domain.nameservers.length > 0 && (
            <div className="border-t pt-3">
              <div className="font-medium mb-1">Nameservers:</div>
              <div className="ml-4 text-xs space-y-1">
                {domain.nameservers.map((ns, index) => (
                  <div key={index} className="break-all">{ns.ldhName}</div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Add landing page button for owners */}
        {ownerAddress && tokenId && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <a
              href={`/builder/new?tokenId=${encodeURIComponent(tokenId)}&domainName=${encodeURIComponent(domain.name)}`}
              className="w-full text-center text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors block"
            >
              Create Landing Page
            </a>
          </div>
        )}
        
        {/* Domain Listing Management for Owners */}
        {ownerAddress && tokenId && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Listing Management</h4>
            
            {loadingListings ? (
              <div className="text-center py-2">
                <span className="text-sm text-gray-500">Loading listings...</span>
              </div>
            ) : domainListings.length > 0 ? (
              // Domain is already listed
              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-800">Currently Listed</span>
                    <span className="text-lg font-bold text-green-600">{domainListings[0].price} ETH</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <input
                    type="number"
                    step="0.001"
                    value={listingPrice}
                    onChange={(e) => setListingPrice(e.target.value)}
                    placeholder="New price in ETH"
                    className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <button
                    onClick={handleUpdateListing}
                    disabled={isUpdating || !listingPrice || listingPrice === domainListings[0].price}
                    className="text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Updating...' : 'Update'}
                  </button>
                </div>
                
                <button
                  onClick={handleCancelListing}
                  disabled={isCanceling}
                  className="w-full text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCanceling ? 'Canceling...' : 'Cancel Listing'}
                </button>
              </div>
            ) : (
              // Domain is not listed
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm text-gray-600">Not currently listed for sale</span>
                </div>
                
                <div className="flex space-x-2">
                  <input
                    type="number"
                    step="0.001"
                    value={listingPrice}
                    onChange={(e) => setListingPrice(e.target.value)}
                    placeholder="Price in ETH"
                    className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <button
                    onClick={handleListDomain}
                    disabled={isListing || !listingPrice}
                    className="text-sm bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isListing ? 'Listing...' : 'List'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function BlockchainUserDomainsSection({ debugAddress }: BlockchainUserDomainsSectionProps) {
  const { domains, loading, error, isConnected, address, refetch } = useDomaBlockchainDomains(debugAddress)

  if (!isConnected) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Blockchain Domains
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Connect your wallet to view domains directly from the blockchain
            </p>
            <ConnectWalletButton />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Your Blockchain Domains
          </h2>
          <p className="text-xl text-gray-600 mb-4">
            Domains fetched directly from the Doma Protocol blockchain
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>

        {loading && (
          <div className="flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {error && (
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Error Loading Domains
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={refetch}
                className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && domains.length === 0 && (
          <div className="text-center">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Domains Found
              </h3>
              <p className="text-gray-600 mb-4">
                You don&#39;t own any domains on the blockchain yet.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Start building your digital identity by minting or purchasing a domain.
              </p>
              <button
                onClick={refetch}
                className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium hover:bg-blue-200 transition-colors mr-3"
              >
                Refresh
              </button>
              <a
                href="/mint"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Mint Domain
              </a>
            </div>
          </div>
        )}

        {!loading && !error && domains.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Found {domains.length} domain{domains.length !== 1 ? 's' : ''}
              </h3>
              <button
                onClick={refetch}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Refresh
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
              {domains.map((domain) => (
                <DomainBlockchainCard 
                  key={`${domain.name}-${domain.tokenizedAt}`} 
                  domain={domain} 
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}