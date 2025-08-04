import { test, expect } from '@playwright/test';

test.describe('Network View Brand Dialog', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the network view
    await page.goto('/network');
    
    // Wait for the network visualization to load
    await page.waitForSelector('svg g[transform]', { timeout: 30000 });
    
    // Wait for brand nodes specifically (they have smaller text)
    await page.waitForSelector('svg text[font-size="10px"]', { timeout: 30000 });
    
    // Give D3 force simulation time to stabilize
    await page.waitForTimeout(3000);
  });

  test('clicking a brand node opens the brand details dialog', async ({ page }) => {
    // Find and click a brand node by its text element
    const clicked = await page.evaluate(() => {
      const brandTexts = Array.from(document.querySelectorAll('svg text[font-size="10px"]'));
      
      if (brandTexts.length > 0) {
        // Get the parent g element
        let parentG = brandTexts[0].parentElement;
        while (parentG && parentG.tagName !== 'g') {
          parentG = parentG.parentElement;
        }
        
        if (parentG) {
          const event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          });
          parentG.dispatchEvent(event);
          return brandTexts[0].textContent;
        }
      }
      return null;
    });
    
    expect(clicked).toBeTruthy();
    
    // Wait for dialog to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    
    // Check for dialog title
    await expect(page.locator('[role="dialog"] h2:has-text("Brand Details")')).toBeVisible();
    
    // Check that brand card is displayed
    await expect(page.locator('[role="dialog"] .group')).toBeVisible();
    
    // Check for brand name in the card
    await expect(page.locator('[role="dialog"] h3')).toContainText(clicked!);
  });

  test('dialog displays brand information correctly', async ({ page }) => {
    // Click a brand node
    await page.evaluate(() => {
      const brandText = document.querySelector('svg text[font-size="10px"]');
      if (brandText) {
        let parentG = brandText.parentElement;
        while (parentG && parentG.tagName !== 'g') {
          parentG = parentG.parentElement;
        }
        if (parentG) {
          parentG.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
      }
    });
    
    // Wait for dialog
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    const dialog = page.locator('[role="dialog"]');
    
    // Check for brand card elements
    // Logo might be loading or hidden if failed to load, so check for either img or the container
    const logoOrContainer = dialog.locator('img, .h-16.w-16').first();
    await expect(logoOrContainer).toBeAttached();
    
    await expect(dialog.locator('h3')).toBeVisible(); // Brand name
    await expect(dialog.locator('button.rounded-md.border')).toBeVisible(); // Category badge
    await expect(dialog.locator('text=Owned by:')).toBeVisible(); // Owner info
  });

  test('dialog can be closed using the X button', async ({ page }) => {
    // Open dialog
    await page.evaluate(() => {
      const brandText = document.querySelector('svg text[font-size="10px"]');
      if (brandText) {
        let parentG = brandText.parentElement;
        while (parentG && parentG.tagName !== 'g') {
          parentG = parentG.parentElement;
        }
        if (parentG) {
          parentG.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
      }
    });
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Click the close button (X icon)
    await page.locator('[role="dialog"] button:has(svg)').first().click();
    
    // Dialog should be closed
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('dialog can be closed by clicking outside', async ({ page }) => {
    // Open dialog
    await page.evaluate(() => {
      const brandText = document.querySelector('svg text[font-size="10px"]');
      if (brandText) {
        let parentG = brandText.parentElement;
        while (parentG && parentG.tagName !== 'g') {
          parentG = parentG.parentElement;
        }
        if (parentG) {
          parentG.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
      }
    });
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Click on the overlay
    await page.locator('.fixed.inset-0.z-50.bg-black\\/50').click({ position: { x: 10, y: 10 } });
    
    // Dialog should be closed
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('dialog can be closed by pressing Escape', async ({ page }) => {
    // Open dialog
    await page.evaluate(() => {
      const brandText = document.querySelector('svg text[font-size="10px"]');
      if (brandText) {
        let parentG = brandText.parentElement;
        while (parentG && parentG.tagName !== 'g') {
          parentG = parentG.parentElement;
        }
        if (parentG) {
          parentG.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
      }
    });
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Press Escape
    await page.keyboard.press('Escape');
    
    // Dialog should be closed
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('clicking category button in dialog navigates to categories', async ({ page }) => {
    // Open dialog
    await page.evaluate(() => {
      const brandText = document.querySelector('svg text[font-size="10px"]');
      if (brandText) {
        let parentG = brandText.parentElement;
        while (parentG && parentG.tagName !== 'g') {
          parentG = parentG.parentElement;
        }
        if (parentG) {
          parentG.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
      }
    });
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Click the category button
    const categoryButton = page.locator('[role="dialog"] button.rounded-md.border');
    await categoryButton.click();
    
    // Should navigate to categories page
    await expect(page).toHaveURL('/categories');
  });

  test('controls text mentions clicking brands for details', async ({ page }) => {
    // Check that the controls help text mentions clicking brands
    const controlsText = page.locator('.absolute.bottom-4.left-4 p');
    await expect(controlsText).toContainText('Click brands for details');
  });

  test('dialog is responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for re-render
    await page.waitForTimeout(1000);
    
    // Open dialog
    await page.evaluate(() => {
      const brandText = document.querySelector('svg text[font-size="10px"]');
      if (brandText) {
        let parentG = brandText.parentElement;
        while (parentG && parentG.tagName !== 'g') {
          parentG = parentG.parentElement;
        }
        if (parentG) {
          parentG.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
      }
    });
    
    // Check dialog is visible and properly sized
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    
    // Check that dialog content fits in viewport
    const dialogBox = await dialog.boundingBox();
    expect(dialogBox).toBeTruthy();
    expect(dialogBox!.width).toBeLessThanOrEqual(375);
  });
});