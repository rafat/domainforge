// src/components/builder/PreviewPanel.tsx
'use client'

import { DomaDomain as Domain } from '@/types/doma'

interface PreviewPanelProps {
  domain: Domain | null
  formData: {
    title: string
    description: string
    template: string
    buyNowPrice: string
    acceptOffers: boolean
  }
}

export function PreviewPanel({ domain, formData }: PreviewPanelProps) {
  const previewData = {
    ...domain,
    name: domain?.name || 'example.com',
    owner: domain?.owner || '0x0000000000000000000000000000000000000000',
    ...formData
  }

  const renderTemplate = () => {
    switch (formData.template) {
      case 'minimal':
        return <MinimalTemplate data={previewData} />
      case 'modern':
        return <ModernTemplate data={previewData} />
      case 'corporate':
        return <CorporateTemplate data={previewData} />
      case 'creative':
        return <CreativeTemplate data={previewData} />
      default:
        return <MinimalTemplate data={previewData} />
    }
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
          {renderTemplate()}
        </div>
      </div>
    </div>
  )
}

// Template Components
function MinimalTemplate({ data }: { data: any }) {
  return (
    <div className="min-h-96 bg-white p-8 text-center">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {data.name || 'example.com'}
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          {data.title || 'Premium Domain For Sale'}
        </p>
        <p className="text-gray-500 mb-8">
          {data.description || 'This premium domain is available for purchase.'}
        </p>
        {data.buyNowPrice && (
          <div className="mb-8">
            <span className="text-3xl font-bold text-green-600">
              {data.buyNowPrice} ETH
            </span>
          </div>
        )}
        <div className="flex justify-center space-x-4">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium">
            Buy Now
          </button>
          <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium">
            Make Offer
          </button>
        </div>
      </div>
    </div>
  )
}

function ModernTemplate({ data }: { data: any }) {
  return (
    <div className="min-h-96 bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {data.name || 'example.com'}
          </h1>
          <p className="text-2xl text-gray-700 mb-6">
            {data.title || 'Premium Domain For Sale'}
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {data.description || 'This premium domain is available for purchase.'}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Domain Details</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Premium .com domain</p>
              <p>• Instant transfer</p>
              <p>• Secure transaction</p>
            </div>
          </div>
          
          <div className="text-center">
            {data.buyNowPrice && (
              <div className="mb-6">
                <span className="text-4xl font-bold text-green-600">
                  {data.buyNowPrice} ETH
                </span>
              </div>
            )}
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-medium text-lg">
              Purchase Domain
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CorporateTemplate({ data }: { data: any }) {
  return (
    <div className="min-h-96 bg-gray-50">
      <nav className="bg-white border-b px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="font-bold text-xl text-gray-900">DomainForge</div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Contact</button>
        </div>
      </nav>
      
      <div className="px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {data.name || 'example.com'}
            </h1>
            <p className="text-xl text-gray-600">
              {data.title || 'Premium Business Domain'}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-3">Instant Transfer</h3>
              <p className="text-gray-600 text-sm">Secure and immediate domain transfer upon payment</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-3">Premium Quality</h3>
              <p className="text-gray-600 text-sm">Hand-selected premium domain with high value potential</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-3">Support Included</h3>
              <p className="text-gray-600 text-sm">Full support throughout the acquisition process</p>
            </div>
          </div>
          
          {data.buyNowPrice && (
            <div className="text-center bg-white p-8 rounded-lg shadow">
              <div className="mb-4">
                <span className="text-3xl font-bold text-green-600">
                  {data.buyNowPrice} ETH
                </span>
              </div>
              <button className="bg-blue-600 text-white px-8 py-3 rounded font-medium">
                Acquire Domain
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CreativeTemplate({ data }: { data: any }) {
  return (
    <div className="min-h-96 bg-black text-white p-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-20 h-20 bg-pink-500 rounded-full blur-xl"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-1/2 w-24 h-24 bg-green-500 rounded-full blur-xl"></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-bold mb-6 animate-pulse">
          <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            {data.name || 'example.com'}
          </span>
        </h1>
        
        <p className="text-2xl mb-4 text-gray-300">
          {data.title || '✨ Unleash Your Creativity ✨'}
        </p>
        
        <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
          {data.description || 'A domain that speaks to your artistic soul and creative vision.'}
        </p>
        
        {data.buyNowPrice && (
          <div className="mb-8">
            <div className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 p-1 rounded-xl">
              <div className="bg-black px-6 py-3 rounded-lg">
                <span className="text-3xl font-bold text-white">
                  {data.buyNowPrice} ETH
                </span>
              </div>
            </div>
          </div>
        )}
        
        <button className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform">
          🚀 Claim This Masterpiece
        </button>
      </div>
    </div>
  )
}
