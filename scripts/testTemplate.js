// @ts-check
const { PrismaClient } = require('@prisma/client');

async function testTemplate() {
  const prisma = new PrismaClient();
  
  try {
    // Get the domain
    const domain = await prisma.domain.findUnique({
      where: { name: 'gavelflow.io' }
    });
    
    if (!domain) {
      console.log('Domain not found');
      return;
    }
    
    // Since we're in a JS file, we need to use require for the TS module
    // But first let's check if the JS version exists
    try {
      const { renderTemplate } = require('../dist/lib/templates');
      
      // Test the renderTemplate function
      const templateHtml = renderTemplate(
        domain.template,
        {
          domainName: domain.name,
          title: domain.title || '',
          description: domain.description || '',
          buyNowPrice: domain.buyNowPrice || ''
        },
        domain.customCSS ? JSON.parse(domain.customCSS) : {}
      );
      
      console.log('Template HTML generated successfully');
      console.log('HTML length:', templateHtml.length);
      console.log('First 200 characters:', templateHtml.substring(0, 200));
    } catch (importError) {
      console.error('Error importing renderTemplate:', importError);
    }
  } catch (error) {
    console.error('Error testing template:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTemplate();