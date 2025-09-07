// scripts/test-unique-constraint.js
// Test script to verify the unique constraint is working

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testUniqueConstraint() {
  console.log('🔍 Testing unique constraint for chat conversations...');
  
  try {
    // Try to create a duplicate conversation (this should fail)
    console.log('🧪 Attempting to create a duplicate conversation...');
    
    // First, let's get an existing conversation to duplicate
    const existingConversation = await prisma.chatConversation.findFirst({
      include: {
        messages: true
      }
    });
    
    if (!existingConversation) {
      console.log('⚠️  No existing conversations found to test duplication');
      return;
    }
    
    console.log(`📋 Found conversation to duplicate: ${existingConversation.id}`);
    console.log(`   Domain ID: ${existingConversation.domainId}`);
    console.log(`   Buyer: ${existingConversation.buyerAddress}`);
    console.log(`   Seller: ${existingConversation.sellerAddress}`);
    
    // Attempt to create a duplicate (this should fail due to unique constraint)
    try {
      const duplicate = await prisma.chatConversation.create({
        data: {
          domainId: existingConversation.domainId,
          buyerAddress: existingConversation.buyerAddress,
          sellerAddress: existingConversation.sellerAddress,
          xmtpConversationId: `test_duplicate_${Date.now()}`,
        }
      });
      
      console.log('❌ ERROR: Duplicate conversation was created (constraint not working!)');
      // Clean up the duplicate if it was somehow created
      await prisma.chatConversation.delete({
        where: { id: duplicate.id }
      });
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('✅ SUCCESS: Unique constraint is working! Duplicate creation was prevented.');
        console.log('   Error message:', error.message);
      } else {
        console.log('⚠️  Unexpected error:', error.message);
      }
    }
    
    console.log('\n🎉 Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUniqueConstraint();