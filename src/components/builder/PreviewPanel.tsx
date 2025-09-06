// src/components/builder/PreviewPanel.tsx
'use client'

import { DomaDomain as Domain } from '@/types/doma'
import { renderTemplate } from '@/lib/templates'

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

interface PreviewPanelProps {
  domain: Domain | null
  formData: {
    title: string
    description: string
    template: string
    buyNowPrice: string
    acceptOffers: boolean
  }
  customization?: CustomizationOptions
}

export function PreviewPanel({ domain, formData, customization }: PreviewPanelProps) {
  const previewData = {
    ...domain,
    name: domain?.name || 'example.com',
    owner: domain?.owner || '0x0000000000000000000000000000000000000000',
    ...formData
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Live Preview</h3>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-white border rounded text-sm">Desktop</button>
          <button className="px-3 py-1 border rounded text-sm text-gray-500">Mobile</button>
        </div>
      </div>
      
      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <div className="scale-90 origin-top-left w-full">
          <div 
            dangerouslySetInnerHTML={{ 
              __html: renderTemplate(
                formData.template as any, 
                {
                  domainName: previewData.name,
                  title: formData.title,
                  description: formData.description,
                  buyNowPrice: formData.buyNowPrice
                },
                customization
              ) 
            }} 
          />
        </div>
      </div>
    </div>
  )
}

// Template Components
function MinimalTemplate({ data, customization }: { data: any; customization?: CustomizationOptions }) {
  const spacingClass = customization?.layoutSpacing === 'compact' ? 'space-y-4' : 
                      customization?.layoutSpacing === 'spacious' ? 'space-y-12' : 'space-y-8'
  
  const textAlignClass = customization?.textAlign === 'left' ? 'text-left' : 
                        customization?.textAlign === 'right' ? 'text-right' : 'text-center'
  
  return (
    <div 
      className="min-h-96 p-8"
      style={{ 
        backgroundColor: customization?.backgroundColor || '#ffffff',
        fontFamily: customization?.fontFamily || 'sans-serif'
      }}
    >
      <div className={`max-w-2xl mx-auto ${spacingClass} ${textAlignClass}`}>
        <h1 
          className="text-4xl font-bold text-gray-900"
          style={{ color: customization?.primaryColor || '#000000' }}
        >
          {data.name || 'example.com'}
        </h1>
        <p 
          className="text-xl text-gray-600"
          style={{ color: customization?.secondaryColor || '#6b7280' }}
        >
          {data.title || 'Premium Domain For Sale'}
        </p>
        <p className="text-gray-500">
          {data.description || 'This premium domain is available for purchase.'}
        </p>
        {data.buyNowPrice && (
          <div>
            <span 
              className="text-3xl font-bold"
              style={{ color: customization?.primaryColor || '#000000' }}
            >
              {data.buyNowPrice} ETH
            </span>
          </div>
        )}
        <div className={`flex ${textAlignClass === 'text-center' ? 'justify-center' : textAlignClass === 'text-right' ? 'justify-end' : 'justify-start'} space-x-4`}>
          <button 
            className={`px-6 py-3 font-medium ${customization?.borderRadius || 'rounded-lg'}`}
            style={{ 
              backgroundColor: customization?.buttonStyle === 'gradient' 
                ? `linear-gradient(to right, ${customization?.primaryColor || '#3b82f6'}, ${customization?.secondaryColor || '#10b981'})`
                : customization?.buttonStyle === 'outline'
                ? 'transparent'
                : customization?.primaryColor || '#3b82f6',
              color: customization?.buttonStyle === 'outline' ? customization?.primaryColor || '#3b82f6' : '#ffffff',
              border: customization?.buttonStyle === 'outline' ? `1px solid ${customization?.primaryColor || '#3b82f6'}` : 'none'
            }}
          >
            Buy Now
          </button>
          <button 
            className={`px-6 py-3 font-medium ${customization?.borderRadius || 'rounded-lg'}`}
            style={{ 
              backgroundColor: customization?.buttonStyle === 'outline' ? 'transparent' : '#ffffff',
              color: customization?.buttonStyle === 'outline' ? customization?.secondaryColor || '#10b981' : customization?.secondaryColor || '#10b981',
              border: `1px solid ${customization?.secondaryColor || '#10b981'}`
            }}
          >
            Make Offer
          </button>
        </div>
      </div>
    </div>
  )
}

function ModernTemplate({ data, customization }: { data: any; customization?: CustomizationOptions }) {
  return (
    <div 
      className="min-h-96 p-8"
      style={{ 
        background: 'linear-gradient(to bottom right, #dbeafe, #ede9fe)',
        fontFamily: customization?.fontFamily || 'sans-serif'
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 
            className="text-5xl font-bold bg-clip-text text-transparent mb-4"
            style={{ 
              backgroundImage: `linear-gradient(to right, ${customization?.primaryColor || '#3b82f6'}, ${customization?.secondaryColor || '#8b5cf6'})`
            }}
          >
            {data.name || 'example.com'}
          </h1>
          <p 
            className="text-2xl text-gray-700 mb-6"
            style={{ color: customization?.secondaryColor || '#6b7280' }}
          >
            {data.title || 'Premium Domain For Sale'}
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {data.description || 'This premium domain is available for purchase.'}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div 
            className={`bg-white shadow-lg ${customization?.borderRadius || 'rounded-xl'} p-6`}
          >
            <h3 
              className="font-semibold text-gray-900 mb-4"
              style={{ color: customization?.primaryColor || '#000000' }}
            >
              Domain Details
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Premium .com domain</p>
              <p>• Instant transfer</p>
              <p>• Secure transaction</p>
            </div>
          </div>
          
          <div className="text-center">
            {data.buyNowPrice && (
              <div className="mb-6">
                <span 
                  className="text-4xl font-bold"
                  style={{ color: customization?.primaryColor || '#000000' }}
                >
                  {data.buyNowPrice} ETH
                </span>
              </div>
            )}
            <button 
              className={`px-8 py-4 font-medium text-lg ${customization?.borderRadius || 'rounded-xl'}`}
              style={{ 
                background: `linear-gradient(to right, ${customization?.primaryColor || '#3b82f6'}, ${customization?.secondaryColor || '#8b5cf6'})`,
                color: '#ffffff'
              }}
            >
              Purchase Domain
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CorporateTemplate({ data, customization }: { data: any; customization?: CustomizationOptions }) {
  return (
    <div 
      className="min-h-96"
      style={{ 
        backgroundColor: customization?.backgroundColor || '#f9fafb',
        fontFamily: customization?.fontFamily || 'sans-serif'
      }}
    >
      <nav className="bg-white border-b px-8 py-4">
        <div className="flex justify-between items-center">
          <div 
            className="font-bold text-xl text-gray-900"
            style={{ color: customization?.primaryColor || '#000000' }}
          >
            DomainForge
          </div>
          <button 
            className={`px-4 py-2 font-medium ${customization?.borderRadius || 'rounded'} text-white`}
            style={{ backgroundColor: customization?.primaryColor || '#3b82f6' }}
          >
            Contact
          </button>
        </div>
      </nav>
      
      <div className="px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 
              className="text-4xl font-bold text-gray-900 mb-4"
              style={{ color: customization?.primaryColor || '#000000' }}
            >
              {data.name || 'example.com'}
            </h1>
            <p 
              className="text-xl text-gray-600"
              style={{ color: customization?.secondaryColor || '#6b7280' }}
            >
              {data.title || 'Premium Business Domain'}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map((item) => (
              <div 
                key={item}
                className={`bg-white rounded-lg shadow p-6 ${customization?.borderRadius || 'rounded-lg'}`}
              >
                <h3 
                  className="font-semibold mb-3"
                  style={{ color: customization?.primaryColor || '#000000' }}
                >
                  Feature {item}
                </h3>
                <p className="text-gray-600 text-sm">
                  {item === 1 && 'Secure and immediate domain transfer upon payment'}
                  {item === 2 && 'Hand-selected premium domain with high value potential'}
                  {item === 3 && 'Full support throughout the acquisition process'}
                </p>
              </div>
            ))}
          </div>
          
          {data.buyNowPrice && (
            <div className={`text-center bg-white p-8 rounded-lg shadow ${customization?.borderRadius || 'rounded-lg'}`}>
              <div className="mb-4">
                <span 
                  className="text-3xl font-bold"
                  style={{ color: customization?.primaryColor || '#000000' }}
                >
                  {data.buyNowPrice} ETH
                </span>
              </div>
              <button 
                className={`px-8 py-3 font-medium text-white ${customization?.borderRadius || 'rounded'}`}
                style={{ backgroundColor: customization?.primaryColor || '#3b82f6' }}
              >
                Acquire Domain
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CreativeTemplate({ data, customization }: { data: any; customization?: CustomizationOptions }) {
  return (
    <div 
      className="min-h-96 text-white p-8 relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(to bottom right, #000000, #111827)',
        fontFamily: customization?.fontFamily || 'sans-serif'
      }}
    >
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute top-10 left-10 w-20 h-20 rounded-full blur-xl"
          style={{ backgroundColor: customization?.primaryColor || '#ec4899' }}
        ></div>
        <div 
          className="absolute top-20 right-20 w-32 h-32 rounded-full blur-2xl"
          style={{ backgroundColor: customization?.secondaryColor || '#3b82f6' }}
        ></div>
        <div 
          className="absolute bottom-20 left-1/2 w-24 h-24 rounded-full blur-xl"
          style={{ backgroundColor: '#10b981' }}
        ></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h1 
          className="text-6xl font-bold mb-6 animate-pulse bg-clip-text text-transparent"
          style={{ 
            backgroundImage: `linear-gradient(to right, ${customization?.primaryColor || '#ec4899'}, ${customization?.secondaryColor || '#8b5cf6'}, ${customization?.primaryColor || '#3b82f6'})`
          }}
        >
          {data.name || 'example.com'}
        </h1>
        
        <p 
          className="text-2xl mb-4 text-gray-300"
          style={{ color: customization?.secondaryColor || '#9ca3af' }}
        >
          {data.title || '✨ Unleash Your Creativity ✨'}
        </p>
        
        <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
          {data.description || 'A domain that speaks to your artistic soul and creative vision.'}
        </p>
        
        {data.buyNowPrice && (
          <div className="mb-8">
            <div 
              className={`inline-block p-1 rounded-xl`}
              style={{ 
                background: `linear-gradient(to right, ${customization?.primaryColor || '#ec4899'}, ${customization?.secondaryColor || '#8b5cf6'})`
              }}
            >
              <div className="bg-black px-6 py-3 rounded-lg">
                <span 
                  className="text-3xl font-bold text-white"
                  style={{ color: customization?.primaryColor || '#ffffff' }}
                >
                  {data.buyNowPrice} ETH
                </span>
              </div>
            </div>
          </div>
        )}
        
        <button 
          className={`px-8 py-4 font-bold text-lg hover:scale-105 transition-transform ${customization?.borderRadius || 'rounded-xl'}`}
          style={{ 
            background: `linear-gradient(to right, ${customization?.primaryColor || '#ec4899'}, ${customization?.secondaryColor || '#8b5cf6'}, ${customization?.primaryColor || '#3b82f6'})`,
            color: '#ffffff'
          }}
        >
          🚀 Claim This Masterpiece
        </button>
      </div>
    </div>
  )
}

function ElegantTemplate({ data, customization }: { data: any; customization?: CustomizationOptions }) {
  return (
    <div 
      className="min-h-96 p-8"
      style={{ 
        background: 'linear-gradient(to bottom right, #fef3c7, #fed7aa)',
        fontFamily: customization?.fontFamily || 'serif'
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div 
              className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${customization?.borderRadius || 'rounded-full'}`}
              style={{ 
                background: `linear-gradient(to bottom right, ${customization?.primaryColor || '#f59e0b'}, ${customization?.secondaryColor || '#ea580c'})`
              }}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          </div>
          <h1 
            className="text-4xl font-light text-gray-900 mb-4"
            style={{ color: customization?.primaryColor || '#000000' }}
          >
            {data.name || 'example.com'}
          </h1>
          <p 
            className="text-xl text-gray-700 mb-4"
            style={{ color: customization?.secondaryColor || '#6b7280' }}
          >
            {data.title || 'Premium Domain For Sale'}
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {data.description || 'This premium domain is available for purchase.'}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
          <div>
            <div className="relative">
              <div 
                className={`absolute -inset-4 transform rotate-1 ${customization?.borderRadius || 'rounded-2xl'}`}
                style={{ 
                  background: `linear-gradient(to right, ${customization?.primaryColor || '#f59e0b'}20, ${customization?.secondaryColor || '#ea580c'}20)`
                }}
              ></div>
              <div 
                className={`relative bg-white shadow-lg p-6 ${customization?.borderRadius || 'rounded-2xl'}`}
              >
                <h3 
                  className="text-xl font-light text-gray-900 mb-4"
                  style={{ color: customization?.primaryColor || '#000000' }}
                >
                  Premium Features
                </h3>
                <ul className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <li key={item} className="flex items-start">
                      <svg 
                        className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                        style={{ color: customization?.primaryColor || '#f59e0b' }}
                      >
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">
                        {item === 1 && 'Blockchain-verified ownership'}
                        {item === 2 && 'Instant and secure transfer'}
                        {item === 3 && 'Permanent record of ownership'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            {data.buyNowPrice && (
              <div 
                className={`rounded-2xl p-1 shadow-xl mb-6 ${customization?.borderRadius || 'rounded-2xl'}`}
                style={{ 
                  background: `linear-gradient(to right, ${customization?.primaryColor || '#f59e0b'}, ${customization?.secondaryColor || '#ea580c'})`
                }}
              >
                <div className={`bg-white rounded-xl p-6 text-center ${customization?.borderRadius || 'rounded-xl'}`}>
                  <p className="text-gray-600 mb-2">Buy Now Price</p>
                  <div 
                    className="text-4xl font-light text-gray-900 mb-4"
                    style={{ color: customization?.primaryColor || '#000000' }}
                  >
                    {data.buyNowPrice} ETH
                  </div>
                  <button 
                    className={`w-full py-3 font-medium hover:shadow-lg transition-all text-white ${customization?.borderRadius || 'rounded-lg'}`}
                    style={{ 
                      background: `linear-gradient(to right, ${customization?.primaryColor || '#f59e0b'}, ${customization?.secondaryColor || '#ea580c'})`
                    }}
                  >
                    Acquire Domain
                  </button>
                </div>
              </div>
            )}
            
            <div className="text-center">
              <button 
                className={`px-6 py-3 font-medium transition-colors border-2 ${customization?.borderRadius || 'rounded-lg'}`}
                style={{ 
                  borderColor: customization?.primaryColor || '#000000',
                  color: customization?.primaryColor || '#000000',
                  backgroundColor: 'transparent'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = customization?.primaryColor || '#000000'
                  e.currentTarget.style.color = '#ffffff'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = customization?.primaryColor || '#000000'
                }}
              >
                Make an Offer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TechTemplate({ data, customization }: { data: any; customization?: CustomizationOptions }) {
  return (
    <div 
      className="min-h-96 text-white p-8"
      style={{ 
        background: 'linear-gradient(to bottom right, #111827, #1f2937)',
        fontFamily: customization?.fontFamily || 'monospace'
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block mb-4 px-3 py-1 rounded-full text-sm font-medium"
            style={{ 
              backgroundColor: `${customization?.primaryColor || '#3b82f6'}20`,
              color: customization?.primaryColor || '#93c5fd'
            }}
          >
            PREMIUM DOMAIN
          </div>
          <h1 
            className="text-4xl font-bold mb-4 tracking-tight"
            style={{ color: customization?.primaryColor || '#ffffff' }}
          >
            {data.name || 'example.com'}
          </h1>
          <p 
            className="text-xl text-gray-300 mb-4"
            style={{ color: customization?.secondaryColor || '#9ca3af' }}
          >
            {data.title || 'Premium Domain For Sale'}
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {data.description || 'This premium domain is available for purchase.'}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
          <div 
            className={`bg-gray-800/50 backdrop-blur-sm border p-6 ${customization?.borderRadius || 'rounded-2xl'}`}
            style={{ borderColor: '#374151' }}
          >
            <h3 
              className="text-xl font-bold mb-4 flex items-center"
              style={{ color: customization?.primaryColor || '#3b82f6' }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Technical Features
            </h3>
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-start">
                  <div 
                    className="w-2 h-2 rounded-full mt-2 mr-3"
                    style={{ backgroundColor: item === 1 ? (customization?.primaryColor || '#3b82f6') : 
                            item === 2 ? '#10b981' : '#8b5cf6' }}
                  ></div>
                  <div>
                    <h4 className="font-medium">
                      {item === 1 && 'Blockchain Verified'}
                      {item === 2 && 'Instant Transfer'}
                      {item === 3 && 'Smart Contract Enabled'}
                    </h4>
                    <p className="text-gray-400 text-sm mt-1">
                      {item === 1 && 'Ownership recorded immutably on the Doma blockchain'}
                      {item === 2 && 'Transfer domain instantly with a single transaction'}
                      {item === 3 && 'Integrate with DeFi protocols and dApps seamlessly'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            {data.buyNowPrice && (
              <div 
                className={`rounded-2xl p-1 shadow-2xl mb-6 ${customization?.borderRadius || 'rounded-2xl'}`}
                style={{ 
                  background: `linear-gradient(to right, ${customization?.primaryColor || '#3b82f6'}, ${customization?.secondaryColor || '#8b5cf6'})`
                }}
              >
                <div 
                  className={`bg-gray-900 rounded-xl p-6 ${customization?.borderRadius || 'rounded-xl'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Buy Now Price</span>
                    <span 
                      className="text-xs px-2 py-1 rounded"
                      style={{ 
                        backgroundColor: `${customization?.primaryColor || '#3b82f6'}20`,
                        color: customization?.primaryColor || '#93c5fd'
                      }}
                    >
                      ETH
                    </span>
                  </div>
                  <div 
                    className="text-4xl font-bold mb-6 font-mono"
                    style={{ color: customization?.primaryColor || '#ffffff' }}
                  >
                    {data.buyNowPrice}
                  </div>
                  <button 
                    className={`w-full py-3 font-medium hover:scale-[1.02] transition-transform shadow-lg ${customization?.borderRadius || 'rounded-lg'}`}
                    style={{ 
                      background: `linear-gradient(to right, ${customization?.primaryColor || '#3b82f6'}, ${customization?.secondaryColor || '#8b5cf6'})`,
                      color: '#ffffff'
                    }}
                  >
                    <div className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Purchase Domain
                    </div>
                  </button>
                </div>
              </div>
            )}
            
            <div 
              className={`bg-gray-800/50 backdrop-blur-sm border p-4 ${customization?.borderRadius || 'rounded-2xl'}`}
              style={{ borderColor: '#374151' }}
            >
              <h4 className="font-medium mb-3">Make an Offer</h4>
              <button 
                className={`w-full py-2 font-medium transition-colors ${customization?.borderRadius || 'rounded-lg'}`}
                style={{ 
                  backgroundColor: '#374151',
                  color: '#ffffff'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#4b5563'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#374151'
                }}
              >
                Connect Wallet to Make Offer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
