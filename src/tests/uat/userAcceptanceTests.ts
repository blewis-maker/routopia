import { test, expect } from '@playwright/test';

export const userAcceptanceTests = {
  // Accessibility scenarios
  accessibility: test.describe('Accessibility Scenarios', () => {
    test('supports keyboard navigation', async ({ page }) => {
      await page.goto('/');
      
      // Tab through elements
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'location-search');
      
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'activity-selector');
    });
  }),

  // Mobile responsiveness
  responsive: test.describe('Responsive Design', () => {
    test('adapts to mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/app');
      
      // Verify mobile layout
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      await expect(page.locator('[data-testid="desktop-sidebar"]')).toBeHidden();
    });
  }),

  // Performance scenarios
  performance: test.describe('Performance Scenarios', () => {
    test('loads within performance budget', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/app');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(3000); // 3s budget
      
      // Check FPS during interaction
      const fps = await page.evaluate(() => {
        return new Promise(resolve => {
          requestAnimationFrame(t1 => {
            requestAnimationFrame(t2 => {
              resolve(1000 / (t2 - t1));
            });
          });
        });
      });
      
      expect(fps).toBeGreaterThan(30);
    });
  })
}; 