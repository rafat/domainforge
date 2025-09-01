// src/lib/templates.ts
export const templates = {
  minimal: `
    <div class="min-h-screen bg-white flex items-center justify-center p-8">
      <div class="max-w-2xl text-center">
        <h1 class="text-5xl font-bold text-gray-900 mb-6">{{domainName}}</h1>
        <p class="text-xl text-gray-600 mb-8">{{title}}</p>
        <p class="text-gray-500 mb-12">{{description}}</p>
        {{#if buyNowPrice}}
        <div class="mb-8">
          <span class="text-4xl font-bold text-green-600">{{buyNowPrice}} ETH</span>
        </div>
        {{/if}}
        <div class="flex justify-center space-x-4">
          <button class="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Buy Now
          </button>
          <button class="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            Make Offer
          </button>
        </div>
      </div>
    </div>
  `,

  modern: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-16">
          <h1 class="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            {{domainName}}
          </h1>
          <p class="text-2xl text-gray-700 mb-6">{{title}}</p>
          <p class="text-gray-600 max-w-2xl mx-auto">{{description}}</p>
        </div>
        
        <div class="grid md:grid-cols-2 gap-8 items-center">
          <div class="bg-white rounded-2xl p-8 shadow-xl">
            <h3 class="text-xl font-semibold text-gray-900 mb-6">Domain Features</h3>
            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-gray-700">Premium .com domain</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-gray-700">Instant transfer</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-gray-700">Secure transaction</span>
              </div>
            </div>
          </div>
          
          <div class="text-center">
            {{#if buyNowPrice}}
            <div class="mb-8">
              <span class="text-5xl font-bold text-green-600">{{buyNowPrice}} ETH</span>
            </div>
            {{/if}}
            <button class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-medium text-lg hover:scale-105 transition-transform shadow-lg">
              Purchase Domain
            </button>
          </div>
        </div>
      </div>
    </div>
  `,

  corporate: `
    <div class="min-h-screen bg-gray-50">
      <nav class="bg-white border-b shadow-sm">
        <div class="max-w-6xl mx-auto px-8 py-4">
          <div class="flex justify-between items-center">
            <div class="text-xl font-bold text-gray-900">DomainForge</div>
            <button class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </nav>
      
      <div class="max-w-6xl mx-auto px-8 py-16">
        <div class="text-center mb-16">
          <h1 class="text-5xl font-bold text-gray-900 mb-6">{{domainName}}</h1>
          <p class="text-2xl text-gray-600">{{title}}</p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8 mb-16">
          <div class="bg-white p-8 rounded-lg shadow-md">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-3">Instant Transfer</h3>
            <p class="text-gray-600">Secure and immediate domain transfer upon payment confirmation</p>
          </div>
          
          <div class="bg-white p-8 rounded-lg shadow-md">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-3">Premium Quality</h3>
            <p class="text-gray-600">Hand-selected premium domain with high commercial value</p>
          </div>
          
          <div class="bg-white p-8 rounded-lg shadow-md">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-3">Full Support</h3>
            <p class="text-gray-600">Complete support throughout the acquisition process</p>
          </div>
        </div>
        
        {{#if buyNowPrice}}
       <div class="bg-white p-12 rounded-2xl shadow-lg text-center">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Acquire This Domain</h2>
          <div class="mb-8">
            <span class="text-4xl font-bold text-green-600">{{buyNowPrice}} ETH</span>
          </div>
          <p class="text-gray-600 mb-8 max-w-2xl mx-auto">{{description}}</p>
          <div class="flex justify-center space-x-4">
            <button class="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Purchase Now
            </button>
            <button class="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Make Offer
            </button>
          </div>
        </div>
        {{/if}}
      </div>
    </div>
  `,
  dark: `
    <div class="min-h-screen bg-gray-900 text-white">
      <div class="max-w-4xl mx-auto p-8">
        <div class="text-center mb-16">
          <h1 class="text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {{domainName}}
          </h1>
          <p class="text-xl text-gray-300 mb-6">{{title}}</p>
          <p class="text-gray-400 max-w-2xl mx-auto">{{description}}</p>
        </div>
        
        <div class="bg-gray-800 rounded-2xl p-8 border border-gray-700">
          <div class="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 class="text-2xl font-bold mb-6">Why This Domain?</h3>
              <div class="space-y-4">
                <div class="flex items-start space-x-3">
                  <div class="w-6 h-6 bg-cyan-500 rounded-full mt-0.5 flex items-center justify-center">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-white font-medium">Memorable & Brandable</p>
                    <p class="text-gray-400 text-sm">Easy to remember and perfect for branding</p>
                  </div>
                </div>
                
                <div class="flex items-start space-x-3">
                  <div class="w-6 h-6 bg-purple-500 rounded-full mt-0.5 flex items-center justify-center">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-white font-medium">High Value Investment</p>
                    <p class="text-gray-400 text-sm">Premium domains appreciate in value over time</p>
                  </div>
                </div>
                
                <div class="flex items-start space-x-3">
                  <div class="w-6 h-6 bg-green-500 rounded-full mt-0.5 flex items-center justify-center">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-white font-medium">SEO Advantage</p>
                    <p class="text-gray-400 text-sm">Premium domains rank better in search results</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="text-center">
              {{#if buyNowPrice}}
              <div class="mb-8">
                <p class="text-gray-400 mb-2">Buy Now Price</p>
                <span class="text-4xl font-bold text-green-400">{{buyNowPrice}} ETH</span>
              </div>
              {{/if}}
              <button class="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-xl font-medium text-lg hover:scale-105 transition-transform">
                Acquire Domain
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}
export function renderTemplate(templateName: keyof typeof templates, data: {
  domainName: string
  title?: string
  description?: string
  buyNowPrice?: string
}): string {
  const template = templates[templateName]
  
  return template
    .replace(/{{domainName}}/g, data.domainName)
    .replace(/{{title}}/g, data.title || 'Premium Domain For Sale')
    .replace(/{{description}}/g, data.description || 'This premium domain is now available for purchase. Contact us to make an offer or buy instantly.')
    .replace(/{{#if buyNowPrice}}(.*?){{\/if}}/g, data.buyNowPrice ? '$1' : '')
    .replace(/{{buyNowPrice}}/g, data.buyNowPrice || '')
}
