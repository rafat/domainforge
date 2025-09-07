// src/lib/templates.ts

export type TemplateName = 'minimal' | 'modern' | 'corporate' | 'creative' | 'elegant' | 'tech';

export const templates = {
  minimal: `
    <div class="min-h-screen flex items-center justify-center p-8" style="{{customStyles.background}}">
      <div class="max-w-2xl {{customStyles.textAlign}} {{customStyles.spacing}}">
        <h1 class="text-5xl font-bold mb-6" style="color: {{customStyles.primaryColor}};">{{domainName}}</h1>
        <p class="text-xl mb-8" style="color: {{customStyles.secondaryColor}};">{{title}}</p>
        <p class="text-gray-500 mb-12">{{description}}</p>
        {{#if buyNowPrice}}
        <div class="mb-8">
          <span class="text-4xl font-bold" style="color: {{customStyles.primaryColor}};">{{buyNowPrice}} ETH</span>
        </div>
        {{/if}}
        <div class="flex {{customStyles.buttonAlignment}} space-x-4">
          <button class="{{customStyles.buttonClasses.primary}}" style="{{customStyles.buttonStyles.primary}}">
            Buy Now
          </button>
          <button class="{{customStyles.buttonClasses.secondary}}" style="{{customStyles.buttonStyles.secondary}}">
            Make Offer
          </button>
        </div>
      </div>
    </div>
  `,

  modern: `
    <div class="min-h-screen p-8" style="background: linear-gradient(to bottom right, #dbeafe, #ede9fe); {{customStyles.background}}">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-16">
          <h1 class="text-6xl font-bold bg-clip-text text-transparent mb-6" style="background: linear-gradient(to right, {{customStyles.primaryColor}}, {{customStyles.secondaryColor}});">
            {{domainName}}
          </h1>
          <p class="text-2xl text-gray-700 mb-6" style="color: {{customStyles.secondaryColor}};">{{title}}</p>
          <p class="text-gray-600 max-w-2xl mx-auto">{{description}}</p>
        </div>
        
        <div class="grid md:grid-cols-2 gap-8 items-center">
          <div class="bg-white rounded-2xl p-8 shadow-xl {{customStyles.borderRadius}}" style="{{customStyles.cardBackground}}">
            <h3 class="text-xl font-semibold mb-6" style="color: {{customStyles.primaryColor}};">Domain Features</h3>
            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 rounded-full" style="background-color: {{customStyles.primaryColor}};"></div>
                <span class="text-gray-700">Premium .com domain</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 rounded-full" style="background-color: {{customStyles.primaryColor}};"></div>
                <span class="text-gray-700">Instant transfer</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 rounded-full" style="background-color: {{customStyles.primaryColor}};"></div>
                <span class="text-gray-700">Secure transaction</span>
              </div>
            </div>
          </div>
          
          <div class="text-center">
            {{#if buyNowPrice}}
            <div class="mb-8">
              <span class="text-5xl font-bold" style="color: {{customStyles.primaryColor}};">{{buyNowPrice}} ETH</span>
            </div>
            {{/if}}
            <button class="w-full px-8 py-4 rounded-2xl font-medium text-lg hover:scale-105 transition-transform shadow-lg {{customStyles.borderRadius}}" style="background: linear-gradient(to right, {{customStyles.primaryColor}}, {{customStyles.secondaryColor}}); color: white;">
              Purchase Domain
            </button>
          </div>
        </div>
      </div>
    </div>
  `,

  corporate: `
    <div class="min-h-screen" style="{{customStyles.background}}">
      <nav class="bg-white border-b shadow-sm px-8 py-4">
        <div class="max-w-6xl mx-auto flex justify-between items-center">
          <div class="text-xl font-bold text-gray-900" style="color: {{customStyles.primaryColor}};">DomainForge</div>
          <button class="px-6 py-2 rounded-lg hover:opacity-90 transition-opacity" style="background-color: {{customStyles.primaryColor}}; color: white;">
            Contact Sales
          </button>
        </div>
      </nav>
      
      <div class="max-w-6xl mx-auto px-8 py-16">
        <div class="text-center mb-16">
          <h1 class="text-5xl font-bold text-gray-900 mb-6" style="color: {{customStyles.primaryColor}};">{{domainName}}</h1>
          <p class="text-2xl text-gray-600" style="color: {{customStyles.secondaryColor}};">{{title}}</p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8 mb-16">
          <div class="bg-white p-8 rounded-lg shadow-md {{customStyles.borderRadius}}" style="{{customStyles.cardBackground}}">
            <div class="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style="background-color: {{customStyles.primaryColor}}10;">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" style="color: {{customStyles.primaryColor}};">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-3" style="color: {{customStyles.primaryColor}};">Instant Transfer</h3>
            <p class="text-gray-600">Secure and immediate domain transfer upon payment confirmation</p>
          </div>
          
          <div class="bg-white p-8 rounded-lg shadow-md {{customStyles.borderRadius}}" style="{{customStyles.cardBackground}}">
            <div class="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style="background-color: {{customStyles.secondaryColor}}10;">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" style="color: {{customStyles.secondaryColor}};">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-3" style="color: {{customStyles.secondaryColor}};">Premium Quality</h3>
            <p class="text-gray-600">Hand-selected premium domain with high commercial value</p>
          </div>
          
          <div class="bg-white p-8 rounded-lg shadow-md {{customStyles.borderRadius}}" style="{{customStyles.cardBackground}}">
            <div class="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style="background-color: {{customStyles.accentColor}}10;">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" style="color: {{customStyles.accentColor}};">
                <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-3" style="color: {{customStyles.accentColor}};">Full Support</h3>
            <p class="text-gray-600">Complete support throughout the acquisition process</p>
          </div>
        </div>
        
        {{#if buyNowPrice}}
       <div class="bg-white p-12 rounded-2xl shadow-lg text-center {{customStyles.borderRadius}}" style="{{customStyles.cardBackground}}">
          <h2 class="text-2xl font-bold text-gray-900 mb-4" style="color: {{customStyles.primaryColor}};">Acquire This Domain</h2>
          <div class="mb-8">
            <span class="text-4xl font-bold" style="color: {{customStyles.primaryColor}};">{{buyNowPrice}} ETH</span>
          </div>
          <p class="text-gray-600 mb-8 max-w-2xl mx-auto">{{description}}</p>
          <div class="flex justify-center space-x-4">
            <button class="px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity" style="background-color: {{customStyles.primaryColor}}; color: white;">
              Purchase Now
            </button>
            <button class="px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity" style="border: 1px solid {{customStyles.secondaryColor}}; color: {{customStyles.secondaryColor}};">
              Make Offer
            </button>
          </div>
        </div>
        {{/if}}
      </div>
    </div>
  `,
  
  creative: `
    <div class="min-h-screen bg-black text-white p-8 relative overflow-hidden" style="{{customStyles.background}}">
      <div class="absolute inset-0 opacity-20">
        <div class="absolute top-10 left-10 w-20 h-20 rounded-full blur-xl" style="background-color: {{customStyles.primaryColor}};"></div>
        <div class="absolute top-20 right-20 w-32 h-32 rounded-full blur-2xl" style="background-color: {{customStyles.secondaryColor}};"></div>
        <div class="absolute bottom-20 left-1/2 w-24 h-24 rounded-full blur-xl" style="background-color: {{customStyles.accentColor}};"></div>
      </div>
      
      <div class="relative z-10 max-w-4xl mx-auto">
        <div class="text-center mb-16">
          <h1 class="text-6xl font-bold mb-6 bg-clip-text text-transparent animate-pulse" style="background: linear-gradient(to right, {{customStyles.primaryColor}}, {{customStyles.secondaryColor}}, {{customStyles.accentColor}});">
            {{domainName}}
          </h1>
          <p class="text-2xl mb-4 text-gray-300" style="color: {{customStyles.secondaryColor}};">{{title}}</p>
          <p class="text-gray-400 mb-12 max-w-2xl mx-auto">{{description}}</p>
        </div>
        
        {{#if buyNowPrice}}
        <div class="mb-8 text-center">
          <div class="inline-block rounded-xl p-1" style="background: linear-gradient(to right, {{customStyles.primaryColor}}, {{customStyles.secondaryColor}});">
            <div class="bg-black px-6 py-3 rounded-lg">
              <span class="text-3xl font-bold text-white" style="color: {{customStyles.primaryColor}};">{{buyNowPrice}} ETH</span>
            </div>
          </div>
        </div>
        {{/if}}
        
        <button class="w-full px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform {{customStyles.borderRadius}}" style="background: linear-gradient(to right, {{customStyles.primaryColor}}, {{customStyles.secondaryColor}}, {{customStyles.accentColor}}); color: white;">
          🚀 Claim This Masterpiece
        </button>
      </div>
    </div>
  `,
  
  elegant: `
    <div class="min-h-screen p-8" style="background: linear-gradient(to bottom right, #fef3c7, #fed7aa); {{customStyles.background}}">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-20">
          <div class="inline-block mb-6">
            <div class="w-16 h-16 rounded-full mx-auto flex items-center justify-center {{customStyles.borderRadius}}" style="background: linear-gradient(to bottom right, {{customStyles.primaryColor}}, {{customStyles.secondaryColor}});">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
            </div>
          </div>
          <h1 class="text-5xl md:text-6xl font-serif font-light text-gray-900 mb-6" style="color: {{customStyles.primaryColor}};">{{domainName}}</h1>
          <p class="text-2xl text-gray-700 mb-6 max-w-2xl mx-auto" style="color: {{customStyles.secondaryColor}};">{{title}}</p>
          <p class="text-gray-600 max-w-2xl mx-auto">{{description}}</p>
        </div>
        
        <div class="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <div class="relative">
              <div class="absolute -inset-4 transform rotate-1 {{customStyles.borderRadius}}" style="background: linear-gradient(to right, {{customStyles.primaryColor}}20, {{customStyles.secondaryColor}}20);"></div>
              <div class="relative bg-white rounded-2xl shadow-lg p-8 {{customStyles.borderRadius}}" style="{{customStyles.cardBackground}}">
                <h3 class="text-2xl font-serif font-light text-gray-900 mb-6" style="color: {{customStyles.primaryColor}};">Premium Features</h3>
                <ul class="space-y-4">
                  <li class="flex items-start">
                    <svg class="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style="color: {{customStyles.primaryColor}};">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-gray-700">Blockchain-verified ownership</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style="color: {{customStyles.primaryColor}};">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-gray-700">Instant and secure transfer</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style="color: {{customStyles.primaryColor}};">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-gray-700">Permanent record of ownership</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            {{#if buyNowPrice}}
            <div class="rounded-2xl p-1 shadow-xl mb-8 {{customStyles.borderRadius}}" style="background: linear-gradient(to right, {{customStyles.primaryColor}}, {{customStyles.secondaryColor}});">
              <div class="bg-white rounded-xl p-8 text-center {{customStyles.borderRadius}}" style="{{customStyles.cardBackground}}">
                <p class="text-gray-600 mb-2">Buy Now Price</p>
                <div class="text-5xl font-serif font-light text-gray-900 mb-6" style="color: {{customStyles.primaryColor}};">{{buyNowPrice}} ETH</div>
                <button class="w-full py-4 rounded-lg font-medium text-lg hover:shadow-lg transition-all {{customStyles.borderRadius}}" style="background: linear-gradient(to right, {{customStyles.primaryColor}}, {{customStyles.secondaryColor}}); color: white;">
                  Acquire Domain
                </button>
              </div>
            </div>
            {{/if}}
            
            <div class="text-center">
              <button class="px-8 py-3 border-2 rounded-lg font-medium hover:opacity-90 transition-opacity {{customStyles.borderRadius}}" style="border-color: {{customStyles.primaryColor}}; color: {{customStyles.primaryColor}}; background-color: transparent;">
                Make an Offer
              </button>
            </div>
          </div>
        </div>
        
        <div class="border-t border-gray-200 pt-12">
          <div class="text-center">
            <p class="text-gray-600">This premium domain is registered on the Doma blockchain</p>
            <div class="mt-4 flex justify-center">
              <div class="flex items-center text-sm text-gray-500">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <span>Secure Transaction</span>
              </div>
              <div class="flex items-center text-sm text-gray-500 ml-6">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                <span>Instant Transfer</span>
              </div>
              <div class="flex items-center text-sm text-gray-500 ml-6">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                <span>Verified Ownership</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  
  tech: `
    <div class="min-h-screen text-white p-8" style="background: linear-gradient(to bottom right, #111827, #1f2937); {{customStyles.background}}">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <div class="inline-block mb-6 px-4 py-1 rounded-full text-sm font-medium" style="background-color: {{customStyles.primaryColor}}20; color: {{customStyles.primaryColor}};">
            PREMIUM DOMAIN
          </div>
          <h1 class="text-5xl md:text-7xl font-mono font-bold mb-6 tracking-tight" style="color: {{customStyles.primaryColor}};">{{domainName}}</h1>
          <p class="text-2xl text-gray-300 mb-6" style="color: {{customStyles.secondaryColor}};">{{title}}</p>
          <p class="text-gray-400 max-w-2xl mx-auto text-lg">{{description}}</p>
        </div>
        
        <div class="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 {{customStyles.borderRadius}}" style="{{customStyles.cardBackground}}">
              <h3 class="text-2xl font-bold mb-6 flex items-center" style="color: {{customStyles.primaryColor}};">
                <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                Technical Features
              </h3>
              <div class="space-y-4">
                <div class="flex items-start">
                  <div class="w-2 h-2 rounded-full mt-2 mr-4" style="background-color: {{customStyles.primaryColor}};"></div>
                  <div>
                    <h4 class="font-medium">Blockchain Verified</h4>
                    <p class="text-gray-400 text-sm mt-1">Ownership recorded immutably on the Doma blockchain</p>
                  </div>
                </div>
                <div class="flex items-start">
                  <div class="w-2 h-2 rounded-full mt-2 mr-4" style="background-color: {{customStyles.accentColor}};"></div>
                  <div>
                    <h4 class="font-medium">Instant Transfer</h4>
                    <p class="text-gray-400 text-sm mt-1">Transfer domain instantly with a single transaction</p>
                  </div>
                </div>
                <div class="flex items-start">
                  <div class="w-2 h-2 rounded-full mt-2 mr-4" style="background-color: {{customStyles.secondaryColor}};"></div>
                  <div>
                    <h4 class="font-medium">Smart Contract Enabled</h4>
                    <p class="text-gray-400 text-sm mt-1">Integrate with DeFi protocols and dApps seamlessly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            {{#if buyNowPrice}}
            <div class="rounded-2xl p-1 shadow-2xl mb-8 {{customStyles.borderRadius}}" style="background: linear-gradient(to right, {{customStyles.primaryColor}}, {{customStyles.secondaryColor}});">
              <div class="bg-gray-900 rounded-xl p-8 {{customStyles.borderRadius}}" style="{{customStyles.cardBackground}}">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-gray-400">Buy Now Price</span>
                  <span class="text-xs px-2 py-1 rounded" style="background-color: {{customStyles.primaryColor}}20; color: {{customStyles.primaryColor}};">ETH</span>
                </div>
                <div class="text-5xl font-mono font-bold mb-8" style="color: {{customStyles.primaryColor}};">{{buyNowPrice}}</div>
                <button class="w-full py-4 rounded-lg font-medium text-lg hover:scale-[1.02] transition-transform shadow-lg {{customStyles.borderRadius}}" style="background: linear-gradient(to right, {{customStyles.primaryColor}}, {{customStyles.secondaryColor}}); color: white;">
                  <div class="flex items-center justify-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                    </svg>
                    Purchase Domain
                  </div>
                </button>
              </div>
            </div>
            {{/if}}
            
            <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 {{customStyles.borderRadius}}" style="{{customStyles.cardBackground}}">
              <h4 class="font-medium mb-4">Make an Offer</h4>
              <button class="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors {{customStyles.borderRadius}}">
                Connect Wallet to Make Offer
              </button>
            </div>
          </div>
        </div>
        
        <div class="grid md:grid-cols-3 gap-6">
          <div class="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center {{customStyles.borderRadius}}" style="{{customStyles.cardBackground}}">
            <div class="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4" style="background-color: {{customStyles.primaryColor}}20;">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: {{customStyles.primaryColor}};">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <h4 class="font-medium mb-2">Secure</h4>
            <p class="text-gray-400 text-sm">Blockchain-secured ownership with no intermediaries</p>
          </div>
          
          <div class="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center {{customStyles.borderRadius}}" style="{{customStyles.cardBackground}}">
            <div class="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4" style="background-color: {{customStyles.accentColor}}20;">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: {{customStyles.accentColor}};">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h4 class="font-medium mb-2">Fast</h4>
            <p class="text-gray-400 text-sm">Transfer instantly with a single transaction</p>
          </div>
          
          <div class="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center {{customStyles.borderRadius}}" style="{{customStyles.cardBackground}}">
            <div class="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4" style="background-color: {{customStyles.secondaryColor}}20;">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: {{customStyles.secondaryColor}};">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
              </svg>
            </div>
            <h4 class="font-medium mb-2">Decentralized</h4>
            <p class="text-gray-400 text-sm">No central authority or middlemen involved</p>
          </div>
        </div>
      </div>
    </div>
  `
}

export function renderTemplate(
  templateName: TemplateName, 
  data: {
    domainName: string
    title?: string
    description?: string
    buyNowPrice?: string
  },
  customization?: any
): string {
  const template = templates[templateName]
  
  // Default customization values
  const customStyles = {
    primaryColor: customization?.primaryColor || '#3b82f6',
    secondaryColor: customization?.secondaryColor || '#10b981',
    accentColor: customization?.accentColor || '#8b5cf6',
    background: `background-color: ${customization?.backgroundColor || '#ffffff'};`,
    cardBackground: `background-color: ${customization?.cardBackgroundColor || '#ffffff'};`,
    fontFamily: customization?.fontFamily || 'sans-serif',
    borderRadius: customization?.borderRadius || 'rounded-lg',
    buttonStyle: customization?.buttonStyle || 'solid',
    layoutSpacing: customization?.layoutSpacing || 'normal',
    textAlign: customization?.textAlign === 'left' ? 'text-left' : 
              customization?.textAlign === 'right' ? 'text-right' : 'text-center',
    buttonAlignment: customization?.textAlign === 'left' ? 'justify-start' : 
                    customization?.textAlign === 'right' ? 'justify-end' : 'justify-center',
    spacing: customization?.layoutSpacing === 'compact' ? 'space-y-4' : 
             customization?.layoutSpacing === 'spacious' ? 'space-y-12' : 'space-y-8',
    buttonClasses: {
      primary: `px-8 py-3 font-medium ${customization?.borderRadius || 'rounded-lg'}`,
      secondary: `px-8 py-3 font-medium ${customization?.borderRadius || 'rounded-lg'}`
    },
    buttonStyles: {
      primary: customization?.buttonStyle === 'gradient' 
        ? `background: linear-gradient(to right, ${customization?.primaryColor || '#3b82f6'}, ${customization?.secondaryColor || '#10b981'}); color: white;`
        : customization?.buttonStyle === 'outline'
        ? `background: transparent; color: ${customization?.primaryColor || '#3b82f6'}; border: 1px solid ${customization?.primaryColor || '#3b82f6'};`
        : `background-color: ${customization?.primaryColor || '#3b82f6'}; color: white;`,
      secondary: customization?.buttonStyle === 'outline' 
        ? `background: transparent; color: ${customization?.secondaryColor || '#10b981'}; border: 1px solid ${customization?.secondaryColor || '#10b981'};`
        : `background-color: ${customization?.secondaryColor || '#10b981'}; color: white;`
    }
  }
  
  return template
    .replace(/{{domainName}}/g, data.domainName)
    .replace(/{{title}}/g, data.title || 'Premium Domain For Sale')
    .replace(/{{description}}/g, data.description || 'This premium domain is now available for purchase. Contact us to make an offer or buy instantly.')
    .replace(/{{#if buyNowPrice}}([\s\S]*?){{\/if}}/g, data.buyNowPrice ? '$1' : '')
    .replace(/{{buyNowPrice}}/g, data.buyNowPrice || '')
    .replace(/{{customStyles\.(.*?)}}/g, (match, p1) => {
      // Handle nested properties like customStyles.buttonStyles.primary
      if (p1.includes('.')) {
        const parts = p1.split('.')
        let value = customStyles as any
        for (const part of parts) {
          value = value[part]
        }
        return value || ''
      }
      return (customStyles as any)[p1] || ''
    })
}
