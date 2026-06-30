const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const newApiUrl = 'https://caresync-backend-api-gl.azurewebsites.net';

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Replace both localhost and 127.0.0.1 hardcoded URLs
            let newContent = content
                .replace(/http:\/\/127\.0\.0\.1:5000/g, newApiUrl)
                .replace(/http:\/\/localhost:5000/g, newApiUrl);
                
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

processDirectory(srcDir);
console.log('Finished updating API URLs.');
