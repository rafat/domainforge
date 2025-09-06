const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDomain() {
  try {
    // Check if domain exists
    const domain = await prisma.domain.findUnique({
      where: { name: 'gavelflow.io' }
    });
    
    if (domain) {
      console.log('Domain found:', domain);
    } else {
      console.log('Domain not found');
    }
  } catch (error) {
    console.error('Error checking domain:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDomain();