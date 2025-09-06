// Simple test to verify renderTemplate function
const fs = require('fs');

// Read the templates file
const templatesContent = fs.readFileSync('./src/lib/templates.ts', 'utf8');

// Extract the minimal template
const minimalTemplateMatch = templatesContent.match(/minimal: `\s*([\s\S]*?)\s*`,/);
if (minimalTemplateMatch) {
  console.log('Minimal template found:');
  console.log(minimalTemplateMatch[1].substring(0, 200) + '...');
} else {
  console.log('Minimal template not found');
}

console.log('\n---\n');

// Test a simple string replacement
const testTemplate = `
<div class="test" style="{{customStyles.background}}">
  <h1 style="color: {{customStyles.primaryColor}};">{{domainName}}</h1>
  <p>{{title}}</p>
  {{#if buyNowPrice}}
  <span>{{buyNowPrice}} ETH</span>
  {{/if}}
</div>
`;

const testData = {
  domainName: 'test.com',
  title: 'Test Domain',
  buyNowPrice: '0.5'
};

const testCustomization = {
  primaryColor: '#ff0000',
  background: 'background-color: #0000ff;'
};

// Simple replacement function
function simpleReplace(template, data, customization) {
  let result = template;
  
  // Replace data placeholders
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, data[key] || '');
  });
  
  // Replace conditional blocks
  result = result.replace(/{{#if buyNowPrice}}([\s\S]*?){{\/if}}/g, data.buyNowPrice ? '$1' : '');
  
  // Replace customization placeholders
  if (customization) {
    Object.keys(customization).forEach(key => {
      const regex = new RegExp(`{{customStyles\\.${key}}}`, 'g');
      result = result.replace(regex, customization[key] || '');
    });
  }
  
  return result;
}

const result = simpleReplace(testTemplate, testData, testCustomization);
console.log('Test result:');
console.log(result);