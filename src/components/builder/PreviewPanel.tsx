// src/components/builder/PreviewPanel.tsx
'use client'

import { DomaDomain as Domain } from '@/types/doma'
import {
  MinimalTemplate,
  ModernTemplate,
  CorporateTemplate,
  CreativeTemplate,
  ElegantTemplate,
  TechTemplate,
  CustomizationProps,
} from '@/components/landing/templates';

interface PreviewPanelProps {
  domain: Domain | null
  formData: {
    title: string
    description: string
    template: string
    buyNowPrice: string
    acceptOffers: boolean
  }
  customization?: CustomizationProps
}

export function PreviewPanel({ domain, formData, customization }: PreviewPanelProps) {
  const previewData = {
    ...domain,
    name: domain?.name || 'example.com',
    owner: domain?.owner || '0x0000000000000000000000000000000000000000',
    ...formData
  } as Domain

  const renderPreviewTemplate = () => {
    if (!previewData) return null;

    const props = {
      domain: previewData,
      customization: customization || null,
    };

    switch (formData.template) {
      case 'minimal':
        return <MinimalTemplate {...props} />;
      case 'modern':
        return <ModernTemplate {...props} />;
      case 'corporate':
        return <CorporateTemplate {...props} />;
      case 'creative':
        return <CreativeTemplate {...props} />;
      case 'elegant':
        return <ElegantTemplate {...props} />;
      case 'tech':
        return <TechTemplate {...props} />;
      default:
        return <MinimalTemplate {...props} />;
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Live Preview</h3>
      </div>
      
      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <div className="scale-90 origin-top-left w-full">
          {renderPreviewTemplate()}
        </div>
      </div>
    </div>
  )
}