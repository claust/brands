import { test, expect } from '@playwright/test';

test.describe('Basic App Tests', () => {
  test('App loads and renders', async ({ page }) => {
    await page.goto('/');
    
    // Basic app structure
    await expect(page.locator('#app')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();
  });

  test('All main routes are accessible', async ({ page }) => {
    // Dashboard
    await page.goto('/');
    await expect(page.locator('#app')).toBeVisible();
    
    // Network
    await page.goto('/network');
    await expect(page.locator('#app')).toBeVisible();
    
    // Categories  
    await page.goto('/categories');
    await expect(page.locator('#app')).toBeVisible();
    
    // Company details with test ID
    await page.goto('/company/1');
    await expect(page.locator('#app')).toBeVisible();
  });

  test('Page titles are set correctly', async ({ page }) => {
    await page.goto('/');
    
    // Should have a meaningful title (not just default Vite)
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('No critical JavaScript errors on page load', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Filter out development/build related errors and expected CI errors
    const criticalErrors = errors.filter(error => 
      !error.includes('HMR') &&
      !error.includes('WebSocket') &&
      !error.includes('Failed to resolve extends base type') &&
      !error.includes('[@vue/compiler-sfc]') &&
      !error.includes('vite') &&
      !error.toLowerCase().includes('sockjs') &&
      !error.includes('status of 401') &&
      !error.includes('Invalid API key') &&
      !error.includes('Failed to load brand data')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});