// scripts/generateTemplatePreviews.js
// Script to generate placeholder images for templates

const fs = require('fs');
const path = require('path');

// Create templates directory if it doesn't exist
const templatesDir = path.join(__dirname, '..', 'public', 'templates');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// Generate simple SVG placeholders for each template
const templates = [
  { id: 'minimal', name: 'Minimal', color: '#3b82f6' },
  { id: 'modern', name: 'Modern', color: '#8b5cf6' },
  { id: 'corporate', name: 'Corporate', color: '#10b981' },
  { id: 'creative', name: 'Creative', color: '#ec4899' },
  { id: 'elegant', name: 'Elegant', color: '#f59e0b' },
  { id: 'tech', name: 'Tech', color: '#6b7280' }
];

templates.forEach(template => {
  const svg = `
<svg width="400" height="225" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f3f4f6"/>
  <rect x="20" y="20" width="360" height="185" fill="${template.color}" fill-opacity="0.1" rx="8"/>
  <text x="200" y="80" font-family="sans-serif" font-size="24" fill="${template.color}" text-anchor="middle">${template.name}</text>
  <text x="200" y="120" font-family="sans-serif" font-size="16" fill="#6b7280" text-anchor="middle">Template Preview</text>
  <rect x="50" y="140" width="300" height="40" fill="#e5e7eb" rx="4"/>
</svg>
  `.trim();

  const filePath = path.join(templatesDir, `${template.id}-preview.png`);
  
  // In a real implementation, we would convert SVG to PNG
  // For now, we'll just create a simple text file to indicate the placeholder
  fs.writeFileSync(filePath, `Template preview for ${template.name}`, 'utf8');
  
  console.log(`Created placeholder for ${template.name} template at ${filePath}`);
});

console.log('Template preview generation complete!');