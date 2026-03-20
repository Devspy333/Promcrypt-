const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace specific Tailwind arbitrary values
  content = content.replace(/text-\[#FF8C00\]/g, 'text-primary');
  content = content.replace(/border-\[#FF8C00\]/g, 'border-primary');
  content = content.replace(/bg-\[#FF8C00\]/g, 'bg-primary');
  content = content.replace(/accent-\[#FF8C00\]/g, 'accent-primary');
  
  // Replace remaining hex codes with CSS variable
  content = content.replace(/#FF8C00/g, 'var(--theme-primary)');
  
  // Replace specific green hex codes that were missed or used for shadows
  content = content.replace(/#00FF0033/g, 'color-mix(in srgb, var(--theme-primary) 20%, transparent)');
  content = content.replace(/#00FF00/g, 'var(--theme-primary)');
  
  // Replace hardcoded backgrounds
  content = content.replace(/bg-black/g, 'bg-bg-base');
  content = content.replace(/bg-\[#110800\]/g, 'bg-panel');
  content = content.replace(/bg-\[#001100\]/g, 'bg-panel');
  
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
console.log('Done replacing colors in TS/TSX files.');
