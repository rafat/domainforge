// src/app/api/ipfs/pin/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { pinataService } from '@/lib/pinata'

export async function POST(request: NextRequest) {
  try {
    const { content, type, name } = await request.json()

    let hash: string

    if (type === 'json') {
      hash = await pinataService.pinJSON(content, name)
    } else if (type === 'html') {
      hash = await pinataService.pinHTML(content, name)
    } else {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      hash,
      url: pinataService.getIPFSUrl(hash)
    })
  } catch (error) {
    console.error('IPFS pin error:', error)
    return NextResponse.json(
      { error: 'Failed to pin content to IPFS' },
      { status: 500 }
    )
  }
}
