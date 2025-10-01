import { NextRequest, NextResponse } from 'next/server';

const DOMA_SUBGRAPH_URL = 'https://api-testnet.doma.xyz/graphql';

export async function POST(request: NextRequest) {
  try {
    const { tokenId } = await request.json();

    if (!tokenId) {
      return NextResponse.json({ error: 'Token ID is required' }, { status: 400 });
    }

    const query = `
      query GetTokenActivity($tokenId: String!) {
        tokenActivities(tokenId: $tokenId, sortOrder: ASC) {
          items {
            __typename
            ... on TokenPurchasedActivity {
              payment {
                price
                currencySymbol
              }
              createdAt
            }
            ... on TokenMintedActivity {
              createdAt
            }
          }
        }
      }
    `;

    const response = await fetch(DOMA_SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { tokenId },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Doma Subgraph API request failed:', errorText);
      return NextResponse.json({ error: `Failed to fetch data from Doma Subgraph: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('Doma Subgraph API returned errors:', data.errors);
      return NextResponse.json({ error: `GraphQL error: ${data.errors[0].message}` }, { status: 400 });
    }

    return NextResponse.json(data.data.tokenActivities);
  } catch (error) {
    console.error('Error in /api/doma/activity proxy:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
