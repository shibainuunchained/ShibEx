
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting build process...');

try {
  // Install dependencies
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit', cwd: process.cwd() });
  
  // Install client dependencies
  console.log('Installing client dependencies...');
  execSync('npm install', { stdio: 'inherit', cwd: path.join(process.cwd(), 'client') });
  
  // Build client
  console.log('Building client...');
  execSync('npm run build', { stdio: 'inherit', cwd: path.join(process.cwd(), 'client') });
  
  // Install API dependencies
  console.log('Installing API dependencies...');
  execSync('npm install', { stdio: 'inherit', cwd: path.join(process.cwd(), 'api') });
  
  console.log('Build completed successfully!');
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
