import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'src/components/AccessibilityPanel.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = {
  'p-1': 'p-[4px]', 'p-2': 'p-[8px]', 'p-3': 'p-[12px]', 'pb-4': 'pb-[16px]', 'pb-3': 'pb-[12px]',
  'px-1': 'px-[4px]', 'px-2': 'px-[8px]', 'px-3': 'px-[12px]', 'px-4': 'px-[16px]', 'px-6': 'px-[24px]',
  'py-2': 'py-[8px]', 'py-2.5': 'py-[10px]', 'py-3.5': 'py-[14px]',
  'pt-2': 'pt-[8px]',
  'gap-1': 'gap-[4px]', 'gap-1.5': 'gap-[6px]', 'gap-2': 'gap-[8px]',
  'my-1': 'my-[4px]', 'mx-3': 'mx-[12px]',
  'mb-1.5': 'mb-[6px]', 'mb-2': 'mb-[8px]', 'mb-3': 'mb-[12px]',
  'w-5': 'w-[20px]', 'h-5': 'h-[20px]',
  'w-14': 'w-[56px]', 'h-14': 'h-[56px]',
  'bottom-6': 'bottom-[24px]', 'left-6': 'left-[24px]',
  'bottom-1.5': 'bottom-[6px]',
  'bottom-20': 'bottom-[80px]',
  '-top-1': '-top-[4px]', '-right-1': '-right-[4px]',
  'text-xs': 'text-[12px]', 'text-sm': 'text-[14px]',
  'rounded-xl': 'rounded-[12px]', 'rounded-2xl': 'rounded-[16px]',
  'w-\\[16.25rem\\]': 'w-[260px]',
  'text-\\[0.6875rem\\]': 'text-[11px]',
  'text-\\[0.625rem\\]': 'text-[10px]',
  'h-\\[0.1875rem\\]': 'h-[3px]',
  'translate-y-4': 'translate-y-[16px]',
};

for (const [search, replace] of Object.entries(replacements)) {
  const regex = new RegExp(`(?<=\\s|['"\`])${search}(?=\\s|['"\`])`, 'g');
  content = content.replace(regex, replace);
}

// Fix specific stuff
content = content.replace(/style=\{\{ transform: 'scale\(var\(--a11y-panel-scale, 1\)\)' \}\}/g, '');
content = content.replace(/style=\{\{\s*maxHeight: 'calc\(100vh \/ var\(--a11y-panel-scale, 1\) - 7\.5rem\)',\s*overflowY: 'auto',\s*transform: `scale\(var\(--a11y-panel-scale, 1\)\) \$\{open \? 'translateY\(0\)' : 'translateY\(1rem\)'\}`\s*\}\}/g, `style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', transform: open ? 'translateY(0)' : 'translateY(16px)' }}`);
content = content.replace(/ origin-bottom-left/g, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done!');
