const fs = require('fs');

// Try to read the templates file
try {
  const templatesContent = fs.readFileSync('./src/lib/templates.ts', 'utf8');
  console.log('Templates file read successfully');
  console.log('File size:', templatesContent.length, 'characters');
  
  // Check if it contains the templates object
  if (templatesContent.includes('export const templates =')) {
    console.log('Templates object found');
  } else {
    console.log('Templates object NOT found');
  }
  
  // Check if it contains the renderTemplate function
  if (templatesContent.includes('export function renderTemplate')) {
    console.log('renderTemplate function found');
  } else {
    console.log('renderTemplate function NOT found');
  }
  
  // Extract a small part of the file to verify content
  console.log('First 500 characters:');
  console.log(templatesContent.substring(0, 500));
} catch (error) {
  console.error('Error reading templates file:', error);
}