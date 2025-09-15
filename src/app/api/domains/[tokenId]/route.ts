// src/app/api/domains/[tokenId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const { tokenId } = await params

  try {
    const domain = await prisma.domain.findUnique({
      where: { tokenId },
      include: {
        dnsRecords: true,
        offers: true
      }
    })

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.domain.update({
      where: { tokenId },
      data: {
        views: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ domain })
  } catch (error) {
    console.error('Failed to fetch domain:', error)
    return NextResponse.json(
      { error: 'Failed to fetch domain' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const { tokenId } = await params

  try {
    const body = await request.json()
    console.log('PUT request body:', body);
    const { price, forSale, records, isActive, title, description, template, buyNowPrice, acceptOffers, customCSS } = body

    const updateData: any = {}
    
    if (price !== undefined) updateData.price = price
    if (forSale !== undefined) updateData.forSale = forSale
    if (isActive !== undefined) updateData.isActive = isActive
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (template !== undefined) updateData.template = template
    if (buyNowPrice !== undefined) updateData.buyNowPrice = buyNowPrice
    if (acceptOffers !== undefined) updateData.acceptOffers = acceptOffers
    if (customCSS !== undefined) updateData.customCSS = customCSS

    console.log('updateData:', updateData);
    console.log('tokenId:', tokenId);

    const domain = await prisma.domain.update({
      where: { tokenId },
      data: updateData,
      include: {
        dnsRecords: true,
        offers: true
      }
    })

    console.log('Updated domain:', domain);

    // Update DNS records if provided
    if (records && Array.isArray(records)) {
      // Delete existing records
      await prisma.dnsRecord.deleteMany({
        where: { domainId: domain.id }
      })

      // Create new records
      if (records.length > 0) {
        await prisma.dnsRecord.createMany({
          data: records.map((record: any) => ({
            ...record,
            domainId: domain.id
          }))
        })
      }
    }

    return NextResponse.json({ domain })
  } catch (error) {
    console.error('Failed to update domain:', error)
    return NextResponse.json(
      { error: 'Failed to update domain' },
      { status: 500 }
    )
  }
}
