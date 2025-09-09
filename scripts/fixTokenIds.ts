import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to fetch actual tokenId from Doma API
async function getActualTokenId(domainName: string): Promise<string> {
  try {
    // Make an actual API call to Doma to get the correct tokenId
    const response = await fetch(process.env.DOMA_API_URL || 'https://api.doma.ai/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DOMA_API_KEY}`
      },
      body: JSON.stringify({
        query: `
          query GetDomainTokenId($name: String!) {
            name(name: $name) {
              tokens {
                tokenId
              }
            }
          }
        `,
        variables: {
          name: domainName
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    if (!result.data?.name?.tokens?.length) {
      throw new Error(`No tokens found for domain: ${domainName}`);
    }

    return result.data.name.tokens[0].tokenId;
  } catch (error) {
    console.error(`Error fetching actual tokenId for ${domainName}:`, error);
    throw error;
  }
}

async function fixTokenIds() {
  try {
    console.log('Starting token ID fix process...');
    
    // Get all domains that have shortened tokenIds (contain letters but are not hex)
    const domains = await prisma.domain.findMany({
      where: {
        tokenId: {
          // Match tokenIds that contain letters but don't start with 0x
          // This should catch the shortened base32-like format
          contains: /[a-z]/i,
          not: {
            startsWith: '0x'
          }
        }
      }
    });

    console.log(`Found ${domains.length} domains with potentially shortened tokenIds`);

    let updatedCount = 0;
    
    for (const domain of domains) {
      try {
        console.log(`Processing domain: ${domain.name} with tokenId: ${domain.tokenId}`);
        
        // Try to get the actual tokenId
        const actualTokenId = await getActualTokenId(domain.name);
        
        // Only update if the actual tokenId is different
        if (actualTokenId !== domain.tokenId) {
          await prisma.domain.update({
            where: { id: domain.id },
            data: { tokenId: actualTokenId }
          });
          
          console.log(`✓ Updated domain ${domain.name} (${domain.id}) with actual tokenId`);
          updatedCount++;
        } else {
          console.log(`- TokenId for ${domain.name} is already correct`);
        }
      } catch (error) {
        console.error(`✗ Error updating domain ${domain.name}:`, error);
      }
    }

    console.log(`Token ID fix process completed. Updated ${updatedCount} domains.`);
  } catch (error) {
    console.error('Error in token ID fix process:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if this file is executed directly
if (require.main === module) {
  fixTokenIds().catch(console.error);
}

export { fixTokenIds, getActualTokenId };