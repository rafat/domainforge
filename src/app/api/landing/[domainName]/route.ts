// src/app/api/landing/[tokenId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { renderTemplate } from '@/lib/templates'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const { tokenId } = await params

  try {
    // Fetch domain from database
    const domain = await prisma.domain.findUnique({
      where: { tokenId }
    })

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      )
    }

    // Check if page is active
    if (!domain.isActive) {
      return NextResponse.json(
        { error: 'Landing page is not active' },
        { status: 404 }
      )
    }

    // Parse customization options
    let customization = {}
    if (domain.customCSS) {
      try {
        customization = JSON.parse(domain.customCSS)
      } catch (e) {
        console.warn('Failed to parse customization data')
      }
    }

    // Render the template with customization
    const html = renderTemplate(
      domain.template as any,
      {
        domainName: domain.name,
        title: domain.title || '',
        description: domain.description || '',
        buyNowPrice: domain.buyNowPrice || ''
      },
      customization
    )

    // Return HTML response
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html'
      }
    })
  } catch (error) {
    console.error('Failed to generate landing page:', error)
    return NextResponse.json(
      { error: 'Failed to generate landing page' },
      { status: 500 }
    )
  }
}