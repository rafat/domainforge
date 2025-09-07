// scripts/cleanup-duplicate-conversations.js
// Script to remove duplicate chat conversations before applying unique constraint

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupDuplicateConversations() {
  console.log('🔍 Finding duplicate conversations...');
  
  try {
    // Find all conversations grouped by the unique constraint fields
    const conversationGroups = await prisma.chatConversation.groupBy({
      by: ['domainId', 'buyerAddress', 'sellerAddress'],
      _count: {
        id: true,
      },
      having: {
        id: {
          _count: {
            gt: 1
          }
        }
      }
    });

    console.log(`Found ${conversationGroups.length} groups with duplicates`);

    for (const group of conversationGroups) {
      console.log(`\n🔧 Processing duplicates for domain ${group.domainId}, buyer ${group.buyerAddress}, seller ${group.sellerAddress}`);
      
      // Get all conversations in this group, ordered by creation date (keep the oldest)
      const conversations = await prisma.chatConversation.findMany({
        where: {
          domainId: group.domainId,
          buyerAddress: group.buyerAddress,
          sellerAddress: group.sellerAddress,
        },
        include: {
          messages: true,
        },
        orderBy: {
          createdAt: 'asc', // Keep the oldest one
        },
      });

      if (conversations.length > 1) {
        const keepConversation = conversations[0]; // Keep the first (oldest) one
        const duplicateConversations = conversations.slice(1); // Remove the rest

        console.log(`  ⚠️  Keeping conversation ${keepConversation.id} (created ${keepConversation.createdAt})`);
        console.log(`  🗑️  Removing ${duplicateConversations.length} duplicate(s)`);

        for (const duplicate of duplicateConversations) {
          console.log(`     - Removing conversation ${duplicate.id} with ${duplicate.messages.length} messages`);
          
          // Delete messages first (due to foreign key constraints)
          if (duplicate.messages.length > 0) {
            await prisma.chatMessage.deleteMany({
              where: {
                conversationId: duplicate.id,
              },
            });
          }
          
          // Delete the duplicate conversation
          await prisma.chatConversation.delete({
            where: {
              id: duplicate.id,
            },
          });
        }
      }
    }

    console.log('\n✅ Cleanup complete!');
    
    // Verify no more duplicates exist
    const remainingDuplicates = await prisma.chatConversation.groupBy({
      by: ['domainId', 'buyerAddress', 'sellerAddress'],
      _count: {
        id: true,
      },
      having: {
        id: {
          _count: {
            gt: 1
          }
        }
      }
    });

    if (remainingDuplicates.length === 0) {
      console.log('✅ No duplicate conversations remain. Ready to apply unique constraint!');
    } else {
      console.log(`❌ ${remainingDuplicates.length} duplicate groups still exist`);
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateConversations();