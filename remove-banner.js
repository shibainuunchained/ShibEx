import fs from 'fs';
import path from 'path';

const distDir = './dist';

function removeBannerFromFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove Replit banner script injection
    content = content.replace(/<script[^>]*replit[^>]*>[\s\S]*?<\/script>/gi, '');
    content = content.replace(/<!--[\s\S]*?replit[\s\S]*?-->/gi, '');

    fs.writeFileSync(filePath, content);
    console.log(`Removed banner from: ${filePath}`);
  } catch (error) {
    console.log(`No banner found or error processing: ${filePath}`);
  }
}

function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory ${dir} does not exist, skipping banner removal.`);
    return;
  }

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.css')) {
      removeBannerFromFile(fullPath);
    }
  });
}

console.log('Starting banner removal process...');
processDirectory(distDir);
console.log('Banner removal complete.');