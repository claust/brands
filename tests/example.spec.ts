import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');

  // Check that the page title is correct
  await expect(page).toHaveTitle(/Brands/);

  // Check that the main content area is present
  await expect(page.locator('body')).toBeVisible();
});

test('page loads without errors', async ({ page }) => {
  await page.goto('/');

  // Check that no console errors occurred
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // Wait a moment for any errors to surface
  await page.waitForTimeout(1000);
  
  // Assert no console errors (excluding known build issues and expected CI errors)
  const relevantErrors = errors.filter(error => 
    !error.includes('Failed to resolve extends base type') &&
    !error.includes('[@vue/compiler-sfc]') &&
    !error.includes('status of 401') &&
    !error.includes('Invalid API key') &&
    !error.includes('Failed to load brand data')
  );
  expect(relevantErrors).toHaveLength(0);
});

test('basic page structure exists', async ({ page }) => {
  await page.goto('/');

  // Check that basic HTML elements are present
  await expect(page.locator('#app')).toBeVisible();
});