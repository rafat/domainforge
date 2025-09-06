// src/app/builder/test/page.tsx
'use client'

import { useState } from 'react'

export default function TestPage() {
  const [domainData, setDomainData] = useState({
    name: 'example.com',
    title: 'Premium Domain For Sale',
    description: 'This is an excellent domain perfect for any business or personal use.',
    template: 'minimal',
    buyNowPrice: '0.5'
  })

  const [customization, setCustomization] = useState({
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
    accentColor: '#8b5cf6',
    backgroundColor: '#ffffff',
    cardBackgroundColor: '#ffffff',
    fontFamily: 'sans-serif',
    borderRadius: 'rounded-lg',
    buttonStyle: 'solid',
    layoutSpacing: 'normal',
    textAlign: 'center'
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Landing Page Builder Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Domain Content</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Domain Name</label>
                  <input
                    type="text"
                    value={domainData.name}
                    onChange={(e) => setDomainData({...domainData, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={domainData.title}
                    onChange={(e) => setDomainData({...domainData, title: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={domainData.description}
                    onChange={(e) => setDomainData({...domainData, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buy Now Price (ETH)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={domainData.buyNowPrice}
                    onChange={(e) => setDomainData({...domainData, buyNowPrice: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Customization</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={customization.primaryColor}
                        onChange={(e) => setCustomization({...customization, primaryColor: e.target.value})}
                        className="w-10 h-10 border rounded"
                      />
                      <input
                        type="text"
                        value={customization.primaryColor}
                        onChange={(e) => setCustomization({...customization, primaryColor: e.target.value})}
                        className="flex-1 p-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={customization.secondaryColor}
                        onChange={(e) => setCustomization({...customization, secondaryColor: e.target.value})}
                        className="w-10 h-10 border rounded"
                      />
                      <input
                        type="text"
                        value={customization.secondaryColor}
                        onChange={(e) => setCustomization({...customization, secondaryColor: e.target.value})}
                        className="flex-1 p-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                  <select
                    value={domainData.template}
                    onChange={(e) => setDomainData({...domainData, template: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="minimal">Minimal</option>
                    <option value="modern">Modern</option>
                    <option value="corporate">Corporate</option>
                    <option value="creative">Creative</option>
                    <option value="elegant">Elegant</option>
                    <option value="tech">Tech</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Preview */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            <div className="border rounded overflow-hidden">
              <div className="bg-gray-100 h-8 flex items-center px-4 text-sm text-gray-500">
                Preview
              </div>
              <div className="h-96 overflow-auto">
                {/* This is where the preview would be rendered */}
                <div className="p-4">
                  <p className="text-gray-600">
                    This is a test page for the landing page builder. In a real implementation,
                    this would show a live preview of the customized landing page.
                  </p>
                  <div className="mt-4 p-4 bg-gray-50 rounded">
                    <h3 className="font-medium">Current Settings:</h3>
                    <pre className="text-xs mt-2 overflow-auto">
                      {JSON.stringify({ domainData, customization }, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}