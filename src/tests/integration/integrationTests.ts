import { test, expect } from '@playwright/test';
import { testData } from '../data/testData';

export const integrationTests = {
  // Full user flow tests
  userFlows: test.describe('User Flows', () => {
    test('complete route planning flow', async ({ page }) => {
      // Start from landing
      await page.goto('/');
      
      // Search location
      await page.fill('[data-testid="location-search"]', 'Mountain Trail');
      await page.click('[data-testid="search-submit"]');
      
      // Select activity
      await page.click('[data-testid="activity-hiking"]');
      
      // Configure route
      await page.fill('[data-testid="distance-input"]', '5');
      await page.selectOption('[data-testid="difficulty"]', 'moderate');
      
      // Generate route
      await page.click('[data-testid="generate-route"]');
      
      // Verify route created
      await expect(page.locator('[data-testid="route-map"]')).toBeVisible();
      await expect(page.locator('[data-testid="route-details"]')).toContainText('5 km');
    });
  }),

  // Store integration tests
  storeIntegration: test.describe('Store Integration', () => {
    test('stores sync correctly', async ({ page }) => {
      await page.goto('/app');
      
      // Update activity
      await page.evaluate(() => {
        window.__STORE__.activity.setActivity('hiking');
      });
      
      // Verify real-time updates
      const realTimeState = await page.evaluate(() => 
        window.__STORE__.realTime.getState()
      );
      expect(realTimeState.activityType).toBe('hiking');
      
      // Verify feedback shown
      await expect(page.locator('[data-testid="feedback-notification"]'))
        .toBeVisible();
    });
  }),

  // API integration tests
  apiIntegration: test.describe('API Integration', () => {
    test('handles API responses correctly', async ({ page, request }) => {
      // Mock API response
      await page.route('**/api/routes', async route => {
        await route.fulfill({ json: testData.routes[0] });
      });
      
      await page.goto('/app/route');
      
      // Verify data displayed
      await expect(page.locator('[data-testid="route-name"]'))
        .toHaveText(testData.routes[0].name);
    });
  })
}; 