const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const rules = [
  { match: /\bbg-white\b/g, replace: 'bg-white dark:bg-gray-800', check: /dark:bg-/ },
  { match: /\bbg-slate-50\b/g, replace: 'bg-slate-50 dark:bg-gray-900', check: /dark:bg-/ },
  { match: /\bbg-slate-100\b/g, replace: 'bg-slate-100 dark:bg-gray-800', check: /dark:bg-/ },
  { match: /\bbg-gray-50\b/g, replace: 'bg-gray-50 dark:bg-gray-900', check: /dark:bg-/ },
  { match: /\bbg-gray-100\b/g, replace: 'bg-gray-100 dark:bg-gray-800', check: /dark:bg-/ },
  { match: /\bbg-gray-200\b/g, replace: 'bg-gray-200 dark:bg-gray-700', check: /dark:bg-/ },
  
  { match: /\btext-slate-900\b/g, replace: 'text-slate-900 dark:text-white', check: /dark:text-/ },
  { match: /\btext-slate-800\b/g, replace: 'text-slate-800 dark:text-white', check: /dark:text-/ },
  { match: /\btext-slate-700\b/g, replace: 'text-slate-700 dark:text-gray-200', check: /dark:text-/ },
  { match: /\btext-slate-600\b/g, replace: 'text-slate-600 dark:text-gray-300', check: /dark:text-/ },
  { match: /\btext-slate-500\b/g, replace: 'text-slate-500 dark:text-gray-400', check: /dark:text-/ },
  
  { match: /\btext-gray-900\b/g, replace: 'text-gray-900 dark:text-white', check: /dark:text-/ },
  { match: /\btext-gray-800\b/g, replace: 'text-gray-800 dark:text-white', check: /dark:text-/ },
  { match: /\btext-gray-700\b/g, replace: 'text-gray-700 dark:text-gray-200', check: /dark:text-/ },
  { match: /\btext-gray-600\b/g, replace: 'text-gray-600 dark:text-gray-300', check: /dark:text-/ },
  { match: /\btext-gray-500\b/g, replace: 'text-gray-500 dark:text-gray-400', check: /dark:text-/ },
  
  { match: /text-\[\#111827\]/g, replace: 'text-[#111827] dark:text-white', check: /dark:text-/ },
  { match: /text-\[\#0a192f\]/g, replace: 'text-[#0a192f] dark:text-white', check: /dark:text-/ },
  { match: /text-\[\#1e3a8a\]/g, replace: 'text-[#1e3a8a] dark:text-white', check: /dark:text-/ },
  { match: /\btext-black\b/g, replace: 'text-black dark:text-white', check: /dark:text-/ },

  { match: /\bborder-slate-100\b/g, replace: 'border-slate-100 dark:border-gray-700', check: /dark:border-/ },
  { match: /\bborder-slate-200\b/g, replace: 'border-slate-200 dark:border-gray-600', check: /dark:border-/ },
  { match: /\bborder-gray-200\b/g, replace: 'border-gray-200 dark:border-gray-700', check: /dark:border-/ },
  { match: /\bborder-gray-300\b/g, replace: 'border-gray-300 dark:border-gray-600', check: /dark:border-/ }
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
