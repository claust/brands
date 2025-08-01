import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Navigate to the local dev server
  await page.goto('http://localhost:5173');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Take a screenshot
  const screenshotPath = join(__dirname, 'screenshot.png');
  await page.screenshot({ 
    path: screenshotPath,
    fullPage: true 
  });
  
  console.log(`Screenshot saved to: ${screenshotPath}`);
  
  await browser.close();
})();