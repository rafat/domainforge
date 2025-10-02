// src/app/api/domains/[tokenId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: any
) {

  try {
    const tokenId: string = params.tokenId;
    const domain = await prisma.domain.findUnique({
      where: { tokenId },
      include: { offers: true }
    })

    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
    }

    return NextResponse.json({ domain })
  } catch (error) {
    console.error(`Failed to fetch domain with tokenId ${params.tokenId}:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch domain' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: any
) {
  try {
    const tokenId: string = params.tokenId;
    const body = await request.json()

    const {
      title,
      description,
      template,
      buyNowPrice,
      acceptOffers,
      customCSS,
      isActive,
      forSale
    } = body

    const dataToUpdate: { [key: string]: any } = {
      updatedAt: new Date()
    }

    if (title !== undefined) dataToUpdate.title = title
    if (description !== undefined) dataToUpdate.description = description
    if (template !== undefined) dataToUpdate.template = template
    if (acceptOffers !== undefined) dataToUpdate.acceptOffers = acceptOffers
    if (customCSS !== undefined) dataToUpdate.customCSS = customCSS
    if (isActive !== undefined) dataToUpdate.isActive = isActive
    if (forSale !== undefined) dataToUpdate.forSale = forSale

    // Handle buyNowPrice: if it's an empty string or null, store null. Otherwise, store the string value.
    if (buyNowPrice !== undefined) {
      dataToUpdate.buyNowPrice = buyNowPrice === '' ? null : buyNowPrice
    }
    
    const updatedDomain = await prisma.domain.update({
      where: { tokenId },
      data: dataToUpdate
    })

    return NextResponse.json({ domain: updatedDomain })
  } catch (error) {
    console.error(`Failed to update domain with tokenId ${params.tokenId}:`, error)
    return NextResponse.json(
      { error: 'Failed to update domain' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: any
) {
  try {
    const tokenId: string = params.tokenId;
    
    const domain = await prisma.domain.findUnique({
      where: { tokenId },
      include: { chatConversations: true }
    });
    
    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    const conversationIds = domain.chatConversations.map(convo => convo.id);

    // Use a transaction to ensure all deletes are successful
    await prisma.$transaction(async (tx) => {
      // Delete records that have a direct relation to the domain
      await tx.offer.deleteMany({ where: { domainId: domain.id } });
      await tx.transaction.deleteMany({ where: { domainId: domain.id } });
      await tx.dnsRecord.deleteMany({ where: { domainId: domain.id } });

      // Delete chat messages related to the conversations of this domain
      if (conversationIds.length > 0) {
        await tx.chatMessage.deleteMany({ where: { conversationId: { in: conversationIds } } });
      }

      // Delete the chat conversations themselves
      await tx.chatConversation.deleteMany({ where: { domainId: domain.id } });

      // Finally, delete the domain
      await tx.domain.delete({ where: { id: domain.id } });
    });
    
    return NextResponse.json({ 
      message: 'Domain and related records deleted successfully' 
    });
  } catch (error) {
    console.error(`Failed to delete domain with tokenId ${params.tokenId}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete domain', details: (error as Error).message },
      { status: 500 }
    );
  }
}
