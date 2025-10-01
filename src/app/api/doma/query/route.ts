import { NextRequest, NextResponse } from 'next/server';

const DOMA_SUBGRAPH_URL = 'https://api-testnet.doma.xyz/graphql';

export async function POST(request: NextRequest) {
  try {
    const { query, variables } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'GraphQL query is required' }, { status: 400 });
    }

    const response = await fetch(DOMA_SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': process.env.DOMA_API_KEY || '',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Doma Subgraph API request failed:', errorText);
      return NextResponse.json({ error: `Failed to fetch data from Doma Subgraph: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('Doma Subgraph API returned errors:', data.errors);
      return NextResponse.json({ error: `GraphQL error: ${data.errors[0].message}`, details: data.errors }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/doma/query proxy:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
