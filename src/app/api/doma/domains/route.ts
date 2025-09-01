// src/app/api/doma/domains/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, variables } = body

    if (!query) {
      return NextResponse.json(
        { error: 'GraphQL query is required' },
        { status: 400 }
      )
    }

    const domaApiKey = process.env.DOMA_API_KEY
    if (!domaApiKey) {
      return NextResponse.json(
        { error: 'Doma API key not configured' },
        { status: 500 }
      )
    }

    console.log('Fetching from Doma API with query:', query.substring(0, 100) + '...')
    console.log('Variables:', variables)

    const response = await fetch('https://api-testnet.doma.xyz/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': domaApiKey,
      },
      body: JSON.stringify({
        query,
        variables
      })
    })

    if (!response.ok) {
      console.error('Doma API HTTP error:', response.status, response.statusText)
      return NextResponse.json(
        { error: `Doma API HTTP error: ${response.status}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    
    if (result.errors && result.errors.length > 0) {
      console.error('Doma API GraphQL errors:', result.errors)
      return NextResponse.json(
        { error: `GraphQL error: ${result.errors[0].message}` },
        { status: 400 }
      )
    }

    console.log('Doma API success, returning data')
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch from Doma API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch domain data from blockchain' },
      { status: 500 }
    )
  }
}