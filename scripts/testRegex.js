// Test the regex pattern for conditional replacement
const template = `
<div>
  {{#if buyNowPrice}}
  <span>{{buyNowPrice}} ETH</span>
  {{/if}}
</div>
`;

const buyNowPrice = '0.2';

// Test the regex
const regex = /{{#if buyNowPrice}}(.*?){{\/if}}/g;
const match = template.match(regex);
console.log('Match:', match);

// Test replacement
const replaced = template.replace(/{{#if buyNowPrice}}(.*?){{\/if}}/g, buyNowPrice ? '$1' : '');
console.log('Replaced:', replaced);

// Test with dotall flag to match newlines
const replacedWithDotall = template.replace(/{{#if buyNowPrice}}([\s\S]*?){{\/if}}/g, buyNowPrice ? '$1' : '');
console.log('Replaced with dotall:', replacedWithDotall);