// src/app/domains/[tokenId]/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useWallet } from '@/hooks/useWallet'
import LoadingSpinner from '@/components/LoadingSpinner'
import TokenIdDisplay from '@/components/TokenIdDisplay'
import { SupabaseChat } from '@/components/landing/SupabaseChat'
import { DomaOffer as Offer, DomaDomain as DomainNFT } from '@/types/doma'
import { useWalletClient } from 'wagmi'
import { buyDomaListing } from '@/lib/domaOrderbookSdk'
import { formatWeiToEth } from '@/utils/tokenIdUtils'

export default function DomainDetailPage() {
  const { tokenId } = useParams()
  const { address, isConnected } = useWallet()
  const { data: walletClient } = useWalletClient();
  const [domain, setDomain] = useState<DomainNFT | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [domaTokenData, setDomaTokenData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [offerAmount, setOfferAmount] = useState('')
  const [submittingOffer, setSubmittingOffer] = useState(false)
  const [currentListing, setCurrentListing] = useState<any>(null)
  const [acceptingOffer, setAcceptingOffer] = useState<any | null>(null)

  useEffect(() => {
    if (tokenId) {
      fetchDomainDetails()
    }
  }, [tokenId])

  const fetchDomainDetails = async () => {
    try {
      setLoading(true)

      // Define the GraphQL query to fetch all necessary data from Doma Subgraph
      const query = `
        query GetTokenAndDomainData($tokenId: String!) {
          token(tokenId: $tokenId) {
            createdAt
            expiresAt
            activities {
              __typename
              ... on TokenPurchasedActivity {
                payment {
                  price
                  currencySymbol
                }
              }
            }
            listings {
              externalId
              price
              orderbook
              currency {
                symbol
                decimals
              }
            }
          }
        }
      `;

      // Fetch data from our local DB, blockchain offers, and the Doma Subgraph in parallel
      const [domainRes, domaOffersRes, domaQueryRes] = await Promise.all([
        fetch(`/api/domains/${tokenId}`),
        fetch(`/api/doma/offers?tokenId=${tokenId}`),
        fetch(`/api/doma/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, variables: { tokenId } }),
        })
      ])
      
      const domainData = await domainRes.json()
      const domaOffersData = await domaOffersRes.json()
      const domaQueryData = await domaQueryRes.json()

      // Combine database offers and blockchain offers
      const dbOffers = (await fetch(`/api/domains/${tokenId}/offers`).then(res => res.json())).offers || [];
      const blockchainOffers = domaOffersData.offers || [];
      
      // Transform blockchain offers to match the expected format
      const transformedBlockchainOffers = blockchainOffers.map((offer: any) => {
        // Handle currency conversion - USDC has 6 decimals, WETH has 18 decimals
        let displayAmount = offer.price;
        if (offer.currency && (offer.currency.symbol === 'USDC' || offer.currency.symbol === 'USDCe')) {
          // Convert from USDC raw units to proper decimal format (divide by 10^6)
          const rawValue = BigInt(offer.price);
          const integerPart = rawValue / BigInt(10 ** 6);
          const decimalPart = rawValue % BigInt(10 ** 6);
          displayAmount = decimalPart > 0 
            ? (Number(integerPart) + Number(decimalPart) / 1e6).toString() 
            : integerPart.toString();
        } else if (offer.currency && (offer.currency.symbol === 'WETH' || offer.currency.symbol === 'ETH')) {
          // Convert from WETH/ETH raw units to proper decimal format (divide by 10^18)
          const ethValue = Number(BigInt(offer.price)) / 1e18;
          displayAmount = ethValue.toString();
        }
        
        return {
          id: offer.id || offer.externalId, // Use externalId if id doesn't exist
          externalId: offer.externalId || offer.id, // Ensure externalId is available for blockchain transactions
          buyer: offer.offererAddress, // Map offererAddress to buyer
          amount: displayAmount, // Use converted amount for display
          currencySymbol: offer.currency?.symbol || 'ETH', // Store currency symbol
          expiresAt: new Date(offer.expiresAt), // Ensure it's a Date object
          createdAt: new Date(offer.createdAt), // Ensure it's a Date object
          status: new Date(offer.expiresAt) > new Date() ? 'PENDING' : 'EXPIRED', // Set status based on expiry
          offererAddress: offer.offererAddress, // Preserve original field name for blockchain functions
          // Add some default values for fields that don't exist in blockchain offers
          domainId: undefined,
          txHash: undefined,
          blockNumber: undefined,
          updatedAt: undefined
        };
      });
      
      // Combine both sets of offers
      const allOffers = [...dbOffers, ...transformedBlockchainOffers];

      if (domaQueryData.errors) {
        console.error('Doma Subgraph GraphQL errors:', domaQueryData.errors);
        throw new Error(domaQueryData.errors[0].message);
      }
      if (!domaQueryData.data || !domaQueryData.data.token) {
        console.error('Unexpected Doma Subgraph response:', domaQueryData);
        throw new Error('Invalid response from Doma Subgraph');
      }

      setDomain(domainData.domain)
      setOffers(allOffers)
      console.log('All offers loaded:', allOffers)
      setDomaTokenData(domaQueryData.data.token)

      // Extract the current listing
      if (domaQueryData.data.token && domaQueryData.data.token.listings && domaQueryData.data.token.listings.length > 0) {
        setCurrentListing(domaQueryData.data.token.listings[0]); // Assuming the first listing is the active one
      } else {
        setCurrentListing(null);
      }

    } catch (error) {
      console.error('Failed to fetch domain details:', error)
    } finally {
      setLoading(false)
    }
  }

  const { originalPrice } = useMemo(() => {
    if (!domaTokenData || !domaTokenData.activities) {
      return { originalPrice: null };
    }

    const firstPurchaseActivity = domaTokenData.activities.find(
      (act: any) => act.__typename === 'TokenPurchasedActivity'
    );

    if (firstPurchaseActivity && firstPurchaseActivity.payment) {
      const priceInWei = BigInt(firstPurchaseActivity.payment.price);
      const priceInEth = Number(priceInWei) / 1e18;
      return {
        originalPrice: `${priceInEth.toFixed(4)} ${firstPurchaseActivity.payment.currencySymbol}`,
      };
    }

    return { originalPrice: null };
  }, [domaTokenData]);

  const handleMakeOffer = async () => {
    if (!isConnected || !offerAmount || !domain) return

    // Validate offer amount
    const offerValue = parseFloat(offerAmount)
    if (isNaN(offerValue) || offerValue <= 0) {
      alert('Please enter a valid offer amount')
      return
    }

    setSubmittingOffer(true)
    try {
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + 7) // 7 days from now

      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenId: domain.tokenId,
          buyer: address,
          amount: offerValue,
          expiry: expiry.toISOString(),
        }),
      })

      if (response.ok) {
        alert('Offer submitted successfully!')
        setOfferAmount('')
        fetchDomainDetails() // Refresh offers
      } else {
        const errorData = await response.json()
        alert(`Failed to submit offer: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to submit offer:', error)
      alert('Failed to submit offer')
    } finally {
      setSubmittingOffer(false)
    }
  }

  const handleBuyNow = async () => {
    if (!isConnected || !domain || !currentListing || !walletClient) {
      alert('Wallet not connected, domain data missing, or no active listing.');
      return;
    }

    // Use buyNowPrice if available, otherwise fallback to price
    const purchasePrice = domain.buyNowPrice || domain.price

    if (!purchasePrice) {
      alert('No purchase price available for this domain')
      return
    }

    try {
      // 1. Initiate blockchain transaction to buy the listing
      const buyResult = await buyDomaListing({
        orderId: currentListing.externalId, // Use externalId
        buyerAddress: address!, // Use the connected wallet address as buyer
      }, walletClient);

      if (!buyResult) {
        throw new Error('Blockchain transaction failed or returned no result.');
      }

      // 2. If blockchain transaction is successful, update the database
      const response = await fetch(`/api/domains/${domain.tokenId}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyer: address,
          amount: purchasePrice,
          orderId: currentListing.externalId, // Use externalId
          txHash: buyResult.transactionHash || 'pending', // Use whatever transaction hash is available
        }),
      })

      if (response.ok) {
        alert('Purchase successful!')
        fetchDomainDetails() // Refresh domain data
      } else {
        const errorData = await response.json()
        alert(`Purchase failed: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Purchase failed:', error)
      alert(`Purchase failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleAcceptOffer = async (offer: any) => {
    if (!isConnected || !isOwner) {
      alert('Only the domain owner can accept offers');
      return;
    }

    if (!window.confirm('Are you sure you want to accept this offer? This will transfer domain ownership.')) {
      return;
    }

    setAcceptingOffer(offer);
    try {
      console.log('Attempting to accept offer:', offer);
      
      // Check if we have the necessary data to accept the offer
      if (!offer.externalId) {
        alert('Cannot accept this offer - missing required order ID for blockchain transaction.');
        return;
      }
      
      // For blockchain offers, we need to use the proper Doma SDK function
      const { acceptDomaOffer } = await import('@/lib/domaOrderbookSdk');
      
      if (!walletClient) {
        throw new Error('Wallet client not available');
      }

      console.log('Calling acceptDomaOffer with orderId:', offer.externalId);
      const result = await acceptDomaOffer(
        offer.externalId,  // Pass orderId directly as first parameter
        walletClient       // walletClient as second parameter
        // chainId as third parameter (using default)
      );

      if (result) {
        // After successful offer acceptance, remove the domain and related data from our database
        // since the domain ownership has transferred and is no longer managed by this seller
        if (domain) {
          try {
            // Delete the domain and all its related records (cascade delete)
            // This will remove: offers, transactions, dns_records, chat_conversations
            await fetch(`/api/domains/${domain.tokenId}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            console.log('Domain and related records removed from database successfully');
          } catch (removeError) {
            console.warn('Failed to remove domain and related data from database:', removeError);
            // Continue even if database removal fails
          }
        }
        
        alert('Offer accepted successfully on blockchain! Domain ownership transferred.');
        fetchDomainDetails(); // Refresh domain and offers data
      } else {
        throw new Error('Failed to accept offer on blockchain');
      }
    } catch (error) {
      console.error('Failed to accept offer:', error);
      // Provide detailed error message
      alert(`Failed to accept offer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setAcceptingOffer(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  if (!domain) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Domain Not Found</h1>
          <p className="text-gray-600 mb-6">
            The domain you're looking for doesn't exist or has been removed.
          </p>
          <a
            href="/marketplace"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse Marketplace
          </a>
        </div>
      </div>
    )
  }
  const isOwner = address && (
    domain.owner.toLowerCase() === address.toLowerCase() || 
    domain.owner.toLowerCase() === `eip155:97476:${address}`.toLowerCase() ||
    domain.owner.toLowerCase().replace(/^eip155:97476:/, '') === address.toLowerCase()
  )
  console.log('Owner check:', { address, domainOwner: domain?.owner, isOwner })
  const tabs = ['overview', 'offers', 'activity', 'records', 'chat']
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Domain Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {domain.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{domain.name}</h1>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="text-gray-600">
                      Owner: {domain.owner.slice(0, 8)}...{domain.owner.slice(-6)}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">
                      Expires: {domaTokenData?.expiresAt ? new Date(domaTokenData.expiresAt).toISOString().split('T')[0] : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
                {domain.forSale && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    For Sale
                  </span>
                )}
                {domain.name.includes('.premium') && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Premium
                  </span>
                )}
              </div>
            </div>
            {/* Action Buttons */}
            <div className="mt-6 lg:mt-0 lg:ml-6">
              {domain.forSale && !isOwner && (
                <div className="space-y-3">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Price</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatWeiToEth(domain.buyNowPrice || domain.price || '0')} ETH
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={handleBuyNow}
                      disabled={!isConnected}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {isConnected ? 'Buy Now' : 'Connect Wallet'}
                    </button>
                    <button
                      onClick={() => setActiveTab('offers')}
                      className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 font-medium"
                    >
                      Make Offer
                    </button>
                  </div>
                </div>
              )}
              {!domain.forSale && !isOwner && (
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-3">Not for sale</div>
                  <button
                    onClick={() => setActiveTab('offers')}
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 font-medium"
                  >
                    Make Offer
                  </button>
                </div>
              )}
                          {isOwner && (
              <div className="text-center space-y-3">
                <div className="text-sm text-gray-600 mb-3">You own this domain</div>
                <a
                  href="/profile"
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 font-medium inline-block"
                >
                  Manage Domain
                </a>
                {domain.isActive ? (
                  <a
                    href={`/landing/${domain.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-100 text-green-700 px-6 py-3 rounded-lg hover:bg-green-200 font-medium inline-block"
                  >
                    View Published Page
                  </a>
                ) : (
                  <a
                    href={`/profile?tab=builder&domain=${domain.tokenId}`}
                    className="bg-blue-100 text-blue-700 px-6 py-3 rounded-lg hover:bg-blue-200 font-medium inline-block"
                  >
                    Create Landing Page
                  </a>
                )}
              </div>
            )}
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
                {tab === 'offers' && offers.length > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {offers.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Info */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Domain Information</h2>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Token ID</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <TokenIdDisplay tokenId={domain.tokenId} />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Registration Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {domaTokenData?.createdAt ? new Date(domaTokenData.createdAt).toISOString().split('T')[0] : 'N/A'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {domaTokenData?.expiresAt ? new Date(domaTokenData.expiresAt).toISOString().split('T')[0] : 'N/A'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Blockchain</dt>
                      <dd className="mt-1 text-sm text-gray-900">Ethereum</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Owner Address</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-mono">
                        {domain.owner}
                      </dd>
                    </div>
                  </dl>
                </div>
                {/* Domain Records */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">DNS Records</h2>
                  <div className="space-y-4">
                    {domain.records && domain.records.length > 0 ? (
                      domain.records.map((record: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium text-gray-900">{record.type}</span>
                              <span className="ml-2 text-gray-600">{record.name}</span>
                            </div>
                            <span className="text-gray-500 font-mono text-sm">{record.value}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No DNS records configured</p>
                    )}
                  </div>
                </div>
              </div>
              {/* Sidebar */}
              <div className="space-y-6">
                {/* Price History */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Price History</h3>
                  <div className="space-y-3">
                    {originalPrice && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Original Price</span>
                        <span className="font-medium">{originalPrice}</span>
                      </div>
                    )}
                    {domain.forSale && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Current Price</span>
                        <span className="font-medium">{formatWeiToEth(domain.buyNowPrice || domain.price || '0')} ETH</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Market Stats */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Views (24h)</span>
                      <span className="font-medium">{domain.views || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Offers</span>
                      <span className="font-medium">{offers.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Length</span>
                      <span className="font-medium">{domain.name.split('.')[0].length} chars</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'offers' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Active Offers ({offers.length})
                  </h2>
                  
                  {offers.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No offers yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {offers.map((offer) => (
                        <div key={offer.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-gray-900">
                                {offer.amount} {offer.currencySymbol || 'ETH'}
                              </div>
                              <div className="text-sm text-gray-600">
                                From {offer.buyer ? `${offer.buyer.slice(0, 8)}...${offer.buyer.slice(-6)}` : 'Unknown'}
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              <div className="text-sm text-gray-600">
                                {offer.expiresAt && new Date(offer.expiresAt) > new Date() 
                                  ? `Expires ${new Date(offer.expiresAt).toLocaleDateString()}` 
                                  : 'Expired'}
                              </div>
                              {(() => {
                                // Safely handle date parsing
                                const offerExpiresAt = offer.expiresAt ? new Date(offer.expiresAt) : null;
                                const now = new Date();
                                const isExpired = offerExpiresAt ? offerExpiresAt <= now : true;
                                
                                console.log('Offer debug:', {
                                  offerId: offer.id,
                                  isOwner,
                                  status: offer.status,
                                  expiresAt: offer.expiresAt,
                                  offerExpiresAt: offerExpiresAt,
                                  isExpired,
                                  conditions: {
                                    isOwner,
                                    isPending: offer.status === 'PENDING',
                                    notExpired: !isExpired
                                  }
                                });
                                return (
                                  isOwner && 
                                  offer.status === 'PENDING' && 
                                  !isExpired && ( // Allow accepting offers
                                  <button
                                    onClick={() => handleAcceptOffer(offer)}
                                    disabled={acceptingOffer && acceptingOffer.id === offer.id}
                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {acceptingOffer && acceptingOffer.id === offer.id ? 'Accepting...' : 'Accept Offer'}
                                  </button>
                                ));
                              })()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Make Offer Sidebar */}
              {!isOwner && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Make an Offer</h3>
                  
                  {!isConnected ? (
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">Connect your wallet to make an offer</p>
                      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                        Connect Wallet
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Offer Amount (ETH)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={offerAmount}
                          onChange={(e) => setOfferAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="text-xs text-gray-600">
                        <p>• Offers expire in 7 days</p>
                        <p>• You can cancel anytime before acceptance</p>
                        <p>• Funds will be held in escrow</p>
                      </div>
                      <button
                        onClick={handleMakeOffer}
                        disabled={!offerAmount || submittingOffer || parseFloat(offerAmount) <= 0}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {submittingOffer ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span className="ml-2">Submitting...</span>
                          </>
                        ) : (
                          'Make Offer'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {activeTab === 'activity' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Activity History</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">Domain Minted</p>
                        <p className="text-sm text-gray-600">
                          Minted by {domain.owner.slice(0, 8)}...{domain.owner.slice(-6)}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(domain.registrationDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {domain.forSale && (
                  <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">Listed for Sale</p>
                          <p className="text-sm text-gray-600">Price: {formatWeiToEth(domain.price || '0')} ETH</p>
                        </div>
                        <span className="text-sm text-gray-500">Recent</span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="text-center py-6 text-gray-500">
                  <p>More activity history coming soon</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'records' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">DNS Records</h2>
                {isOwner && (
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                    Edit Records
                  </button>
                )}
              </div>
              {domain.records && domain.records.length > 0 ? (
                <div className="space-y-4">
                  {domain.records.map((record: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Type</span>
                          <p className="mt-1 text-gray-900">{record.type}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Name</span>
                          <p className="mt-1 text-gray-900">{record.name}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Value</span>
                          <p className="mt-1 text-gray-900 font-mono text-sm break-all">{record.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286M30 14a6 6 0 11-12 0 6 6 0 0112 0zm12 6a4 4 0 11-8 0 4 4 0 018 0zm-28 0a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No DNS Records</h3>
                  <p className="text-gray-500 mb-6">
                    {isOwner 
                      ? "Configure DNS records to point your domain to websites, wallets, or other services."
                      : "This domain hasn't configured any DNS records yet."
                    }
                  </p>
                  {isOwner && (
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                      Add DNS Record
                    </button>
                  )}
                </div>
              )}
              {isOwner && domain.records && domain.records.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 mr-3">
                    Add Record
                  </button>
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                    Import from ENS
                  </button>
                </div>
              )}
            </div>
          )}
          {activeTab === 'chat' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Chat with Owner</h2>
              <div className="h-96">
                <SupabaseChat 
                  domainId={domain.id} 
                  ownerAddress={domain.owner.trim()} 
                  domainName={domain.name} 
                  tokenId={domain.tokenId} 
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

