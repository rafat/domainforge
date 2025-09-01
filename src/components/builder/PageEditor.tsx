// src/components/builder/PageEditor.tsx
'use client'

import { useState } from 'react'
import { useDomainData } from '@/hooks/useDomainData'
import { TemplateSelector } from './TemplateSelector'
import { PreviewPanel } from './PreviewPanel'

interface PageEditorProps {
  domainId: string
}

export function PageEditor({ domainId }: PageEditorProps) {
  const { domain, updateDomain } = useDomainData(domainId)
  const [formData, setFormData] = useState({
    title: domain?.title || '',
    description: domain?.description || '',
    template: domain?.template || 'minimal',
    buyNowPrice: domain?.buyNowPrice || '',
    acceptOffers: domain?.acceptOffers || true,
    isActive: domain?.isActive || false
  })
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)

  const handleSave = async () => {
    try {
      setSaving(true)
      await updateDomain(domainId, formData)
      alert('Changes saved successfully!')
    } catch (error) {
      console.error('Failed to save changes:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    try {
      setPublishing(true)
      await updateDomain(domainId, { ...formData, isActive: true })
      alert('Landing page published successfully! Visit /landing/[tokenId] to view it.')
    } catch (error) {
      console.error('Failed to publish page:', error)
      alert('Failed to publish page. Please try again.')
    } finally {
      setPublishing(false)
    }
  }

  const handleUnpublish = async () => {
    try {
      setPublishing(true)
      await updateDomain(domainId, { ...formData, isActive: false })
      alert('Landing page unpublished successfully!')
    } catch (error) {
      console.error('Failed to unpublish page:', error)
      alert('Failed to unpublish page. Please try again.')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Editor Panel */}
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
        
        <div className="flex flex-col space-y-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          
          {formData.isActive ? (
            <button
              onClick={handleUnpublish}
              disabled={publishing}
              className="w-full bg-yellow-600 text-white py-3 rounded-lg font-medium hover:bg-yellow-700 disabled:opacity-50"
            >
              {publishing ? 'Unpublishing...' : 'Unpublish Page'}
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {publishing ? 'Publishing...' : 'Publish Landing Page'}
            </button>
          )}
          
          {formData.isActive && (
            <div className="text-center text-sm text-green-600 bg-green-50 p-2 rounded">
              ✅ Page is published! Visit: /landing/{domainId}
            </div>
          )}
        </div>
      </div>
      
      {/* Preview Panel */}
      <PreviewPanel domain={domain} formData={formData} />
    </div>
  )
}
