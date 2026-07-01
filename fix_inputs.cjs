const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('focus:bg-white')) {
    // Replace focus:bg-white with focus:bg-white dark:focus:bg-gray-800
    // only if dark:focus:bg-gray-800 isn't already there
    const newContent = content.replace(/\bfocus:bg-white\b(?! dark:focus:bg-gray-800)/g, 'focus:bg-white dark:focus:bg-gray-800');
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

walkDir(srcDir);
console.log('Done!');
