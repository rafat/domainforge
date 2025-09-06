// @ts-check
const { execSync } = require('child_process');

// First, let's build the project to make sure the TypeScript is compiled
try {
  console.log('Building project...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build completed successfully');
} catch (error) {
  console.log('Build failed, but continuing with test...');
}

// Try to import and test the renderTemplate function
async function testRenderTemplate() {
  try {
    // Try to dynamically import the compiled JS version
    const { renderTemplate } = await import('../dist/lib/templates.js');
    
    // Test the renderTemplate function
    const templateHtml = renderTemplate(
      'minimal',
      {
        domainName: 'gavelflow.io',
        title: 'GavelFlowDOTIO',
        description: 'Auction X3',
        buyNowPrice: '0.2'
      },
      {
        "primaryColor": "#3b82f6",
        "secondaryColor": "#10b981",
        "accentColor": "#8b5cf6",
        "backgroundColor": "#ffffff",
        "cardBackgroundColor": "#ffffff",
        "fontFamily": "sans-serif",
        "borderRadius": "rounded-lg",
        "buttonStyle": "solid",
        "layoutSpacing": "normal",
        "textAlign": "center"
      }
    );
    
    console.log('Template HTML generated successfully');
    console.log('HTML length:', templateHtml.length);
    console.log('First 200 characters:', templateHtml.substring(0, 200));
  } catch (error) {
    console.error('Error testing renderTemplate:', error);
    
    // Try to directly read and test the TS file
    try {
      const fs = require('fs');
      const templatesContent = fs.readFileSync('./src/lib/templates.ts', 'utf8');
      console.log('Templates file read successfully, length:', templatesContent.length);
    } catch (readError) {
      console.error('Error reading templates file:', readError);
    }
  }
}

testRenderTemplate();