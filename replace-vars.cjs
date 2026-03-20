const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(/text-\[var\(--theme-primary\)]/g, 'text-primary');
  content = content.replace(/border-\[var\(--theme-primary\)]/g, 'border-primary');
  content = content.replace(/bg-\[var\(--theme-primary\)]/g, 'bg-primary');
  
  fs.writeFileSync(filePath, content);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir('src');
console.log('Done replacing var(--theme-primary) in TS/TSX files.');
