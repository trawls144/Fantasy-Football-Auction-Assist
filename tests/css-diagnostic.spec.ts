import { test, expect } from '@playwright/test';

test('CSS diagnostic - check styling and take screenshots', async ({ page }) => {
  // Enable console logging to catch any errors
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://localhost:3000/');

  // Take a full page screenshot
  await page.screenshot({ path: 'tests/screenshots/full-page.png', fullPage: true });

  // Check if CSS files are loading
  const stylesheets = await page.locator('link[rel="stylesheet"]').count();
  console.log(`Found ${stylesheets} stylesheet links`);

  // Check if Tailwind CSS classes are being applied
  const body = page.locator('body');
  const bodyClasses = await body.getAttribute('class');
  console.log('Body classes:', bodyClasses);

  // Check the main container
  const mainContainer = page.locator('.min-h-screen');
  const containerExists = await mainContainer.count();
  console.log(`Main container with .min-h-screen found: ${containerExists > 0}`);

  if (containerExists > 0) {
    const computedStyle = await mainContainer.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        minHeight: styles.minHeight,
        background: styles.background,
        padding: styles.padding
      };
    });
    console.log('Main container computed styles:', computedStyle);
  }

  // Check if the title has gradient styling
  const title = page.locator('h1');
  const titleExists = await title.count();
  console.log(`Title found: ${titleExists > 0}`);

  if (titleExists > 0) {
    const titleClasses = await title.getAttribute('class');
    console.log('Title classes:', titleClasses);
    
    const titleComputedStyle = await title.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        background: styles.background,
        backgroundImage: styles.backgroundImage,
        webkitBackgroundClip: styles.webkitBackgroundClip,
        color: styles.color
      };
    });
    console.log('Title computed styles:', titleComputedStyle);
  }

  // Check for any network errors
  const response = await page.goto('http://localhost:3000/');
  console.log('Page response status:', response?.status());

  // Get all network requests to see if CSS is loading
  const requests = [];
  page.on('request', request => {
    if (request.url().includes('.css') || request.url().includes('/_next/static/css/')) {
      requests.push(request.url());
    }
  });

  // Reload to catch CSS requests
  await page.reload();
  await page.waitForTimeout(2000); // Wait for all resources to load

  console.log('CSS requests found:', requests);

  // Check if Next.js is working properly
  const nextScript = await page.locator('script[src*="_next"]').count();
  console.log(`Next.js scripts found: ${nextScript}`);

  // Take a screenshot of specific elements
  const budgetTracker = page.locator('text=Remaining Budget').first();
  if (await budgetTracker.count() > 0) {
    await budgetTracker.screenshot({ path: 'tests/screenshots/budget-tracker.png' });
  }

  // Check if any inline styles are present
  const elementsWithInlineStyles = await page.locator('[style]').count();
  console.log(`Elements with inline styles: ${elementsWithInlineStyles}`);
});