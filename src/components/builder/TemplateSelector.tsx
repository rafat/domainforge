// src/components/builder/TemplateSelector.tsx
'use client'

import { useState } from 'react'
import { Template } from '@/types/domain'

const templates: Template[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    preview: '/templates/minimal-preview.png',
    description: 'Clean, simple design focusing on the domain',
    category: 'minimal'
  },
  {
    id: 'modern',
    name: 'Modern',
    preview: '/templates/modern-preview.png',
    description: 'Contemporary design with gradients and animations',
    category: 'modern'
  },
  {
    id: 'corporate',
    name: 'Corporate',
    preview: '/templates/corporate-preview.png',
    description: 'Professional business-focused layout',
    category: 'corporate'
  },
  {
    id: 'creative',
    name: 'Creative',
    preview: '/templates/creative-preview.png',
    description: 'Bold, artistic design for unique domains',
    category: 'creative'
  },
  {
    id: 'elegant',
    name: 'Elegant',
    preview: '/templates/elegant-preview.png',
    description: 'Sophisticated design with premium aesthetics',
    category: 'elegant'
  },
  {
    id: 'tech',
    name: 'Tech',
    preview: '/templates/tech-preview.png',
    description: 'Modern tech-focused design for developers',
    category: 'tech'
  }
]

interface TemplateSelectorProps {
  selected: string
  onChange: (templateId: string) => void
}

export function TemplateSelector({ selected, onChange }: TemplateSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const categories = ['all', 'minimal', 'modern', 'corporate', 'creative', 'elegant', 'tech']

  const filteredTemplates = activeCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === activeCategory)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Template</h3>
        
        {/* Category Filter */}
        <div className="flex flex-wrap space-x-2 mb-4">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1 rounded-full text-sm capitalize transition-colors mb-2 ${
                activeCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            onClick={() => onChange(template.id)}
            className={`cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
              selected === template.id
                ? 'border-blue-500 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="aspect-video bg-gray-100 relative">
              {/* 
              <img
                src={template.preview}
                alt={template.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/templates/placeholder.png'
                }}
              />
              */}
              {selected === template.id && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="p-3">
              <h4 className="font-medium">{template.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
