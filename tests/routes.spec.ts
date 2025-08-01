import { test, expect } from '@playwright/test';

test.describe('Route Navigation Tests', () => {
  test('Dashboard route loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check that we're on the dashboard
    await expect(page).toHaveURL('/');
    
    // Check for dashboard-specific content
    await expect(page.locator('h1').first()).toBeVisible();
    
    // Ensure page loads without errors
    await expect(page.locator('#app')).toBeVisible();
  });

  test('Network view route loads correctly', async ({ page }) => {
    await page.goto('/network');
    
    // Check that we're on the network page
    await expect(page).toHaveURL('/network');
    
    // Check for network-specific content (main D3 visualization SVG)
    await expect(page.locator('svg').last()).toBeVisible();
    
    // Ensure main app container is present
    await expect(page.locator('#app')).toBeVisible();
  });

  test('Categories view route loads correctly', async ({ page }) => {
    await page.goto('/categories');
    
    // Check that we're on the categories page
    await expect(page).toHaveURL('/categories');
    
    // Check for categories-specific content - just ensure page loaded
    await expect(page.locator('main').first()).toBeVisible();
    
    // Ensure main app container is present
    await expect(page.locator('#app')).toBeVisible();
  });

  test('Company details route loads correctly', async ({ page }) => {
    // Use a test company ID (assuming company ID 1 exists)
    await page.goto('/company/1');
    
    // Check that we're on the company details page
    await expect(page).toHaveURL('/company/1');
    
    // Check for company details content
    await expect(page.locator('.company, .company-details, h1, h2')).toBeVisible();
    
    // Ensure main app container is present
    await expect(page.locator('#app')).toBeVisible();
  });

  test('Navigation between routes works', async ({ page }) => {
    // Start at dashboard
    await page.goto('/');
    await expect(page).toHaveURL('/');
    
    // Navigate to network (if navigation links exist)
    const networkLink = page.locator('a[href="/network"], nav a:has-text("Network")');
    if (await networkLink.isVisible()) {
      await networkLink.click();
      await expect(page).toHaveURL('/network');
    }
    
    // Navigate to categories (if navigation links exist)
    const categoriesLink = page.locator('a[href="/categories"], nav a:has-text("Categories")');
    if (await categoriesLink.isVisible()) {
      await categoriesLink.click();
      await expect(page).toHaveURL('/categories');
    }
  });

  test('Invalid routes are handled', async ({ page }) => {
    await page.goto('/invalid-route-that-does-not-exist');
    
    // Wait for any redirects to complete
    await page.waitForTimeout(1000);
    
    // Should have some content (either 404 or redirected to valid page)
    await expect(page.locator('#app')).toBeVisible();
  });
});

test.describe('Page Content Tests', () => {
  test('Dashboard shows expected content structure', async ({ page }) => {
    await page.goto('/');
    
    // Check for common UI elements
    await expect(page.locator('header').first()).toBeVisible();
    
    // Check for main content area
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('Network view shows visualization elements', async ({ page }) => {
    await page.goto('/network');
    
    // Wait for potential D3 rendering
    await page.waitForTimeout(2000);
    
    // Look for main visualization SVG (last SVG is likely the D3 visualization)
    const mainVisualization = page.locator('svg').last();
    await expect(mainVisualization).toBeVisible();
  });

  test('Categories view shows category content', async ({ page }) => {
    await page.goto('/categories');
    
    // Wait for content to load
    await page.waitForTimeout(1000);
    
    // Should have some form of content
    const hasContent = await page.locator('main, .main, .content, .categories').isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('Search functionality exists and is accessible', async ({ page }) => {
    await page.goto('/');
    
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], .search input');
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeEditable();
    }
  });
});

test.describe('Error Handling Tests', () => {
  test('Pages load without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    const routes = ['/', '/network', '/categories', '/company/1'];
    
    for (const route of routes) {
      await page.goto(route);
      await page.waitForTimeout(1000);
    }
    
    // Filter out known build/dev errors
    const relevantErrors = errors.filter(error => 
      !error.includes('Failed to resolve extends base type') &&
      !error.includes('[@vue/compiler-sfc]') &&
      !error.includes('HMR') &&
      !error.includes('WebSocket')
    );
    
    expect(relevantErrors).toHaveLength(0);
  });

  test('App container exists on all routes', async ({ page }) => {
    const routes = ['/', '/network', '/categories', '/company/1'];
    
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('#app')).toBeVisible();
    }
  });
});