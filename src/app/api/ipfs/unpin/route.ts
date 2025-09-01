// src/app/api/ipfs/unpin/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { pinataService } from '@/lib/pinata'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hash = searchParams.get('hash')

    if (!hash) {
      return NextResponse.json({ error: 'Hash is required' }, { status: 400 })
    }

    await pinataService.unpin(hash)

    return NextResponse.json({
      success: true,
      message: 'Content unpinned successfully'
    })
  } catch (error) {
    console.error('IPFS unpin error:', error)
    return NextResponse.json(
      { error: 'Failed to unpin content from IPFS' },
      { status: 500 }
    )
  }
}
