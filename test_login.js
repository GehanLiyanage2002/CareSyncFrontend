import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Users/pubudu/.cache/puppeteer/chrome/win64-149.0.7827.22/chrome-win64/chrome.exe' });
  const page = await browser.newPage();
  
  // Capture console logs
  page.on('console', msg => {
    console.log(`BROWSER CONSOLE [${msg.type()}]:`, msg.text());
  });
  
  // Capture page errors (uncaught exceptions in the browser)
  page.on('pageerror', error => {
    console.error('BROWSER ERROR:', error.message);
  });

  try {
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    
    // Type credentials
    await page.type('input[type="email"]', 'admin');
    await page.type('input[type="password"]', 'admin123');
    
    // Click submit
    await page.click('button[type="submit"]');
    
    // Wait for navigation or a few seconds
    await new Promise(r => setTimeout(r, 5000));
    
    console.log("Current URL:", page.url());
  } catch (err) {
    console.error("Puppeteer script error:", err);
  } finally {
    await browser.close();
  }
})();
