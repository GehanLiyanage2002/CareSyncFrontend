const https = require('https');

https.get('https://caresync-frontend-app-gl.azurewebsites.net/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/src="(\/assets\/index-[^"]+\.js)"/);
    if (match) {
      console.log('Found JS bundle:', match[1]);
      https.get('https://caresync-frontend-app-gl.azurewebsites.net' + match[1], (res2) => {
        let jsData = '';
        res2.on('data', chunk => jsData += chunk);
        res2.on('end', () => {
          if (jsData.includes('http://caresync-backend-api-gl.azurewebsites.net')) {
            console.log('STILL USING HTTP in bundle!');
          } else if (jsData.includes('https://caresync-backend-api-gl.azurewebsites.net')) {
            console.log('USING HTTPS in bundle!');
          } else {
            console.log('No backend URL found in bundle');
          }
        });
      });
    } else {
      console.log('Could not find JS bundle in HTML');
    }
  });
});
