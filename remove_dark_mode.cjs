const fs = require('fs');
const path = require('path');

const targetPaths = [
  'D:/React Project/CareSync/CareSyncFrontend/src/components/admin',
  'D:/React Project/CareSync/CareSyncFrontend/src/pages/AdminDashboard.jsx',
  'D:/React Project/CareSync/CareSyncFrontend/src/pages/Receptionist'
];

function removeDarkModeClasses(content) {
  // Regex to match dark:bg-gray-800, dark:text-white, etc.
  // It matches 'dark:' followed by word characters or dashes, up to a boundary or space.
  return content.replace(/\bdark:[a-zA-Z0-9-]+\b/g, '').replace(/  +/g, ' '); // also clean up double spaces
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = removeDarkModeClasses(content);

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Removed dark mode from: ${filePath}`);
  }
}

function processPath(targetPath) {
  if (!fs.existsSync(targetPath)) return;
  
  const stats = fs.statSync(targetPath);
  if (stats.isDirectory()) {
    const files = fs.readdirSync(targetPath);
    for (const file of files) {
      processPath(path.join(targetPath, file));
    }
  } else if (targetPath.endsWith('.jsx')) {
    processFile(targetPath);
  }
}

targetPaths.forEach(processPath);
console.log('Done removing dark mode from admin and receptionist!');
