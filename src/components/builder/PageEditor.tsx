// src/components/builder/PageEditor.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDomainData } from '@/hooks/useDomainData'
import { TemplateSelector } from './TemplateSelector'
import { PreviewPanel } from './PreviewPanel'
import { DomaDomain } from '@/types/doma'
import { useWalletClient, useSignTypedData } from 'wagmi'
import { createSeaportOrderParameters, createSeaportEip712Types } from '@/lib/seaportUtils'
import { domaApi } from '@/lib/domaApi'
import { createDomaListing } from '@/lib/domaOrderbookSdk'

interface PageEditorProps {
  domainId?: string
  initialDomain?: DomaDomain
  onSave?: (data: any) => void
}

interface CustomizationOptions {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  cardBackgroundColor: string
  fontFamily: string
  borderRadius: string
  buttonStyle: 'solid' | 'outline' | 'gradient'
  layoutSpacing: 'compact' | 'normal' | 'spacious'
  textAlign: 'left' | 'center' | 'right'
}

interface FormData {
  title: string
  description: string
  template: string
  buyNowPrice: string
  acceptOffers: boolean
}

export function PageEditor({ domainId, initialDomain, onSave }: PageEditorProps) {
  const router = useRouter()
  const { domain, updateDomain } = useDomainData(domainId || '', initialDomain || undefined)
  const [formData, setFormData] = useState<FormData>({
    title: initialDomain?.title || domain?.title || '',
    description: initialDomain?.description || domain?.description || '',
    template: initialDomain?.template || domain?.template || 'minimal',
    buyNowPrice: initialDomain?.buyNowPrice || domain?.buyNowPrice || '',
    acceptOffers: initialDomain?.acceptOffers !== undefined ? initialDomain.acceptOffers : (domain?.acceptOffers !== undefined ? domain?.acceptOffers : true)
  })
  
  const [customization, setCustomization] = useState<CustomizationOptions>({
    primaryColor: '#3b82f6', // blue-500
    secondaryColor: '#10b981', // emerald-500
    accentColor: '#8b5cf6', // violet-500
    backgroundColor: '#ffffff',
    cardBackgroundColor: '#ffffff',
    fontFamily: 'sans-serif',
    borderRadius: 'rounded-lg',
    buttonStyle: 'solid',
    layoutSpacing: 'normal',
    textAlign: 'center'
  })
  
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'settings'>('content')
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)

  // Wallet hooks
  const { data: walletClient } = useWalletClient()
  const { signTypedDataAsync } = useSignTypedData()

  const handlePublish = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log('handlePublish called');
    try {
      setPublishing(true)
      
      // If onSave callback is provided, use it (for new domains)
      if (onSave) {
        console.log('Using onSave callback');
        // Save the domain data first
        const saveResult: any = await onSave({
          ...formData,
          isActive: true,
          forSale: true, // Set forSale to true when publishing
          customCSS: JSON.stringify(customization)
        })
        
        // Extract the domain from the save result
        const savedDomain = saveResult?.domain || saveResult;
        
        // If we have a buyNowPrice and wallet client, create a listing
        if (formData.buyNowPrice && walletClient && savedDomain?.tokenId) {
          console.log('Debug - Connected wallet:', walletClient.account.address);
          console.log('Debug - Domain owner:', savedDomain.owner);
          
          // Check if the connected wallet is the owner of the domain
          if (walletClient.account.address.toLowerCase() !== savedDomain.owner.toLowerCase()) {
            alert(`You must be the owner of this domain to list it for sale. Connected wallet: ${walletClient.account.address}, Domain owner: ${savedDomain.owner}`)
            setPublishing(false)
            return
          }
          
          try {
            // Get the contract address from the domain data
            // For blockchain domains, this will be in the tokens array
            // For database domains, this will be in the contractAddress field
            let contractAddress = "0x424bDf2E8a6F52Bd2c1C81D9437b0DC0309DF90f"; // Doma testnet ownership token address
            
            console.log('Using contract address:', contractAddress);
            
            // Fetch fees from our proxy
            const feesResponse = await fetch('/api/doma/fees', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contractAddress,
                chainId: 'eip155:97476', // Doma testnet
                orderbook: 'DOMA',
              }),
            });

            if (!feesResponse.ok) {
              const errorData = await feesResponse.json();
              throw new Error(`Failed to fetch fees: ${errorData.details?.message || 'Unknown error'}`);
            }

            const fees = await feesResponse.json();
            console.log('Fetched fees via proxy:', fees);

            // Fetch supported currencies
            const currenciesResponse = await fetch('/api/doma/currencies', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contractAddress,
                chainId: 'eip155:97476', // Doma testnet
                orderbook: 'DOMA',
              }),
            });

            let currency;
            if (currenciesResponse.ok) {
              const currenciesData = await currenciesResponse.json();
              console.log('Fetched currencies via proxy:', currenciesData);
              // Use the first currency (ETH) if available
              if (currenciesData.currencies && currenciesData.currencies.length > 0) {
                currency = currenciesData.currencies.find((c: any) => c.symbol === 'ETH') || currenciesData.currencies[0];
              }
            } else {
              console.warn('Failed to fetch currencies, using default ETH');
              // Default to ETH if we can't fetch currencies
              // For native ETH on most chains, we should not include currencyContractAddress
              // or use the correct contract address if required by Doma API
              currency = {
                contractAddress: "0x0000000000000000000000000000000000000000", // Native ETH contract address
                symbol: "ETH",
                decimals: 18
              };
            }

            // Create listing using Doma Orderbook SDK
            const listingResult = await createDomaListing(
              {
                contractAddress: contractAddress,
                tokenId: savedDomain.tokenId,
                price: formData.buyNowPrice,
                sellerAddress: savedDomain.owner,
              },
              walletClient,
              'eip155:97476',
              fees.marketplaceFees,
              currency
            );
            
            console.log('Domain listed successfully with Doma SDK!', listingResult);
          } catch (listingError) {
            console.error('Failed to list domain with Doma SDK:', listingError);
            // Let's get more detailed error information
            if (listingError instanceof Error) {
              console.error('Error details:', listingError.message);
              if ((listingError as any).info) {
                console.error('Error info:', (listingError as any).info);
              }
              if ((listingError as any).status) {
                console.error('Error status:', (listingError as any).status);
              }
            }
            alert(`Domain published but failed to list: ${listingError instanceof Error ? listingError.message : 'Unknown error'}`);
          }
        }
        
        return
      }
      
      // Otherwise, update existing domain using domain name
      console.log('Updating existing domain');
      if (!domain?.tokenId) {
        throw new Error('Domain tokenId is required')
      }
      
      const updatedDomain = await updateDomain(domain.tokenId, { 
        ...formData, 
        isActive: true,
        forSale: true,
        customCSS: JSON.stringify(customization)
      })
      console.log('Domain updated, updatedDomain:', updatedDomain);
      
      // If we have a buyNowPrice and wallet client, create a listing
      if (formData.buyNowPrice && walletClient && updatedDomain?.tokenId) {
        console.log('Debug - Connected wallet:', walletClient.account.address);
        console.log('Debug - Domain owner:', updatedDomain.owner);
        
        // Check if the connected wallet is the owner of the domain
        if (walletClient.account.address.toLowerCase() !== updatedDomain.owner.toLowerCase()) {
          alert(`You must be the owner of this domain to list it for sale. Connected wallet: ${walletClient.account.address}, Domain owner: ${updatedDomain.owner}`)
          setPublishing(false)
          return
        }
        
        try {
          // Get the contract address from the domain data
          // For blockchain domains, this will be in the tokens array
          // For database domains, this will be in the contractAddress field
          let contractAddress = "0x424bDf2E8a6F52Bd2c1C81D9437b0DC0309DF90f"; // Doma testnet ownership token address
          
          if (updatedDomain.contractAddress) {
            // Database domain
            contractAddress = updatedDomain.contractAddress;
          } else if (updatedDomain.tokenAddress) {
            // Blockchain domain
            contractAddress = updatedDomain.tokenAddress;
          }
          
          console.log('Using contract address:', contractAddress);
          
          // Fetch fees from our proxy
          const feesResponse = await fetch('/api/doma/fees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contractAddress,
              chainId: 'eip155:97476', // Doma testnet
              orderbook: 'DOMA',
            }),
          });

          if (!feesResponse.ok) {
            const errorData = await feesResponse.json();
            throw new Error(`Failed to fetch fees: ${errorData.details?.message || 'Unknown error'}`);
          }

          const fees = await feesResponse.json();
          console.log('Fetched fees via proxy:', fees);

          // Fetch supported currencies
          const currenciesResponse = await fetch('/api/doma/currencies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contractAddress,
              chainId: 'eip155:97476', // Doma testnet
              orderbook: 'DOMA',
            }),
          });

          let currency;
          if (currenciesResponse.ok) {
            const currenciesData = await currenciesResponse.json();
            console.log('Fetched currencies via proxy:', currenciesData);
            // Use the first currency (ETH) if available
            if (currenciesData.currencies && currenciesData.currencies.length > 0) {
              currency = currenciesData.currencies.find((c: any) => c.symbol === 'ETH') || currenciesData.currencies[0];
            }
          } else {
            console.warn('Failed to fetch currencies, using default ETH');
            // Default to ETH if we can't fetch currencies
            // For native ETH on most chains, we should not include currencyContractAddress
            // or use the correct contract address if required by Doma API
            currency = {
              contractAddress: "0x0000000000000000000000000000000000000000", // Native ETH contract address
              symbol: "ETH",
              decimals: 18
            };
          }

          // Create listing using Doma Orderbook SDK
          const listingResult = await createDomaListing(
            {
              contractAddress: contractAddress,
              tokenId: updatedDomain.tokenId,
              price: formData.buyNowPrice,
              sellerAddress: updatedDomain.owner,
            },
            walletClient,
            'eip155:97476',
            fees.marketplaceFees,
            currency
          );
          
          console.log('Domain listed successfully with Doma SDK!', listingResult);
        } catch (listingError) {
          console.error('Failed to list domain with Doma SDK:', listingError);
          // Let's get more detailed error information
          if (listingError instanceof Error) {
            console.error('Error details:', listingError.message);
            if ((listingError as any).info) {
              console.error('Error info:', (listingError as any).info);
            }
            if ((listingError as any).status) {
              console.error('Error status:', (listingError as any).status);
            }
          }
          alert(`Domain published but failed to list: ${listingError instanceof Error ? listingError.message : 'Unknown error'}`);
        }
      }
      
      // Redirect to the landing page after successful publication
      if (updatedDomain?.name) {
        console.log('Redirecting to landing page:', `/landing/${updatedDomain.name}`);
        try {
          router.push(`/landing/${updatedDomain.name}`);
        } catch (redirectError) {
          console.error('Router push error:', redirectError);
        }
      }
    } catch (error) {
      console.error('Failed to publish page:', error)
      alert('Failed to publish page. Please try again.')
    } finally {
      setPublishing(false)
    }
  }

  const fontOptions = [
    { id: 'sans-serif', name: 'Sans Serif' },
    { id: 'serif', name: 'Serif' },
    { id: 'monospace', name: 'Monospace' },
    { id: "'Inter', sans-serif", name: 'Inter' },
    { id: "'Roboto', sans-serif", name: 'Roboto' },
    { id: "'Open Sans', sans-serif", name: 'Open Sans' }
  ]

  const borderRadiusOptions = [
    { id: 'rounded-none', name: 'None' },
    { id: 'rounded-sm', name: 'Small' },
    { id: 'rounded', name: 'Medium' },
    { id: 'rounded-lg', name: 'Large' },
    { id: 'rounded-xl', name: 'Extra Large' },
    { id: 'rounded-2xl', name: '2XL' }
  ]

  const layoutSpacingOptions = [
    { id: 'compact', name: 'Compact' },
    { id: 'normal', name: 'Normal' },
    { id: 'spacious', name: 'Spacious' }
  ]

  const textAlignOptions = [
    { id: 'left', name: 'Left' },
    { id: 'center', name: 'Center' },
    { id: 'right', name: 'Right' }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Editor Panel */}
      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('content')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'content'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab('design')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'design'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Design
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <TemplateSelector 
              selected={formData.template}
              onChange={(template) => setFormData({...formData, template})}
            />
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Page Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  placeholder="Premium Domain For Sale"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 border rounded-lg h-32"
                  placeholder="Describe your domain's value..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Buy Now Price (ETH)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.buyNowPrice}
                  onChange={(e) => setFormData({...formData, buyNowPrice: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Design Tab */}
        {activeTab === 'design' && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Design Customization</h3>
              <p className="text-sm text-blue-600">
                Customize the look and feel of your landing page
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Colors */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Colors</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={customization.primaryColor}
                        onChange={(e) => setCustomization({...customization, primaryColor: e.target.value})}
                        className="w-10 h-10 border rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customization.primaryColor}
                        onChange={(e) => setCustomization({...customization, primaryColor: e.target.value})}
                        className="flex-1 p-2 border rounded text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Secondary Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={customization.secondaryColor}
                        onChange={(e) => setCustomization({...customization, secondaryColor: e.target.value})}
                        className="w-10 h-10 border rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customization.secondaryColor}
                        onChange={(e) => setCustomization({...customization, secondaryColor: e.target.value})}
                        className="flex-1 p-2 border rounded text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Accent Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={customization.accentColor}
                        onChange={(e) => setCustomization({...customization, accentColor: e.target.value})}
                        className="w-10 h-10 border rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customization.accentColor}
                        onChange={(e) => setCustomization({...customization, accentColor: e.target.value})}
                        className="flex-1 p-2 border rounded text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Background
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={customization.backgroundColor}
                        onChange={(e) => setCustomization({...customization, backgroundColor: e.target.value})}
                        className="w-10 h-10 border rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customization.backgroundColor}
                        onChange={(e) => setCustomization({...customization, backgroundColor: e.target.value})}
                        className="flex-1 p-2 border rounded text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Card Background
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={customization.cardBackgroundColor}
                        onChange={(e) => setCustomization({...customization, cardBackgroundColor: e.target.value})}
                        className="w-10 h-10 border rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customization.cardBackgroundColor}
                        onChange={(e) => setCustomization({...customization, cardBackgroundColor: e.target.value})}
                        className="flex-1 p-2 border rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Typography */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Typography</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Font Family
                    </label>
                    <select
                      value={customization.fontFamily}
                      onChange={(e) => setCustomization({...customization, fontFamily: e.target.value})}
                      className="w-full p-3 border rounded-lg"
                    >
                      {fontOptions.map((font) => (
                        <option key={font.id} value={font.id}>
                          {font.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Text Alignment
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {textAlignOptions.map((align) => (
                        <button
                          key={align.id}
                          onClick={() => setCustomization({...customization, textAlign: align.id as any})}
                          className={`py-2 px-3 border text-sm font-medium rounded-md ${
                            customization.textAlign === align.id
                              ? 'bg-blue-100 border-blue-500 text-blue-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {align.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Layout */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Layout</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Border Radius
                    </label>
                    <select
                      value={customization.borderRadius}
                      onChange={(e) => setCustomization({...customization, borderRadius: e.target.value})}
                      className="w-full p-3 border rounded-lg"
                    >
                      {borderRadiusOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Spacing
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {layoutSpacingOptions.map((spacing) => (
                        <button
                          key={spacing.id}
                          onClick={() => setCustomization({...customization, layoutSpacing: spacing.id as any})}
                          className={`py-2 px-3 border text-sm font-medium rounded-md ${
                            customization.layoutSpacing === spacing.id
                              ? 'bg-blue-100 border-blue-500 text-blue-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {spacing.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Button Style */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Button Style</h4>
                <div className="grid grid-cols-3 gap-3">
                  {(['solid', 'outline', 'gradient'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => setCustomization({...customization, buttonStyle: style})}
                      className={`py-2 px-3 border text-sm font-medium rounded-md ${
                        customization.buttonStyle === style
                          ? 'bg-blue-100 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Page Settings</h3>
              <p className="text-sm text-gray-600">
                Configure page behavior and options
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Accept Offers</h4>
                  <p className="text-sm text-gray-600">
                    Allow buyers to make offers on this domain
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.acceptOffers}
                    onChange={(e) => setFormData({...formData, acceptOffers: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Advanced Settings</h4>
                <p className="text-sm text-yellow-700">
                  These settings will be available in future updates
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" disabled className="mr-2" />
                    <span className="text-sm text-gray-500">SEO Optimization</span>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" disabled className="mr-2" />
                    <span className="text-sm text-gray-500">Analytics Tracking</span>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" disabled className="mr-2" />
                    <span className="text-sm text-gray-500">Custom Domain</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); handlePublish(); }}
            disabled={publishing}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {publishing ? 'Publishing...' : 'Publish Landing Page'}
          </button>
          
          {domain?.isActive && domainId && !onSave && domain && (
            <div className="text-center text-sm text-green-600 bg-green-50 p-2 rounded">
              {`✅ Page is published! Visit: /landing/${domain.name}`}
            </div>
          )}
        </div>
      </div>
      
      {/* Preview Panel */}
      <PreviewPanel domain={domain || initialDomain || null} formData={formData} customization={customization} />
    </div>
  )
}