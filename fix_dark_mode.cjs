const fs = require('fs');
const path = require('path');

const srcDir = 'D:/React Project/CareSync/CareSyncFrontend/src';

const rules = [
  { match: /\bbg-white\b/g, replace: 'bg-white dark:bg-gray-800', check: /dark:bg-/ },
  { match: /\bbg-slate-50\b/g, replace: 'bg-slate-50 dark:bg-gray-900', check: /dark:bg-/ },
  { match: /\btext-slate-800\b/g, replace: 'text-slate-800 dark:text-white', check: /dark:text-/ },
  { match: /\btext-slate-700\b/g, replace: 'text-slate-700 dark:text-gray-200', check: /dark:text-/ },
  { match: /\btext-slate-600\b/g, replace: 'text-slate-600 dark:text-gray-300', check: /dark:text-/ },
  { match: /\btext-slate-500\b/g, replace: 'text-slate-500 dark:text-gray-400', check: /dark:text-/ },
  { match: /\bborder-slate-100\b/g, replace: 'border-slate-100 dark:border-gray-700', check: /dark:border-/ },
  { match: /\bborder-slate-200\b/g, replace: 'border-slate-200 dark:border-gray-600', check: /dark:border-/ }
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let lineModified = false;
    
    rules.forEach(rule => {
      if (line.match(rule.match)) {
        line = line.replace(rule.match, (match) => {
          // If the line already has a dark variant of this property, skip to avoid conflicts
          if (rule.check.test(line)) {
             return match;
          }
          lineModified = true;
          return rule.replace;
        });
      }
    });
    
    if (lineModified) {
      lines[i] = line;
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`Updated: ${filePath}`);
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
