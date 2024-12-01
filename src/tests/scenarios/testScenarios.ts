import { test, expect } from '@playwright/test';
import { testData } from '../data/testData';

// Test scenarios
export const scenarios = {
  // Route Planning Flow
  routePlanning: test('complete route planning flow', async ({ page }) => {
    // Start from home
    await page.goto('/');
    
    // Select activity
    await page.click('[data-testid="activity-selector"]');
    await page.click('[data-testid="activity-hiking"]');
    
    // Set preferences
    await page.fill('[data-testid="distance-input"]', '8.5');
    await page.selectOption('[data-testid="difficulty"]', 'moderate');
    
    // Generate route
    await page.click('[data-testid="generate-route"]');
    
    // Verify route generated
    await expect(page.locator('[data-testid="route-map"]')).toBeVisible();
    await expect(page.locator('[data-testid="route-details"]')).toContainText('8.5 km');
  }),

  // Real-time Updates
  realTimeUpdates: test('handle real-time updates', async ({ page }) => {
    // Load route page
    await page.goto('/app/route/route-1');
    
    // Trigger weather update
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('weather-update', {
        detail: testData.weather
      }));
    });
    
    // Verify updates reflected
    await expect(page.locator('[data-testid="weather-display"]'))
      .toContainText('18°C');
  }),

  // Error Handling
  errorHandling: test('handle various error states', async ({ page }) => {
    // Test network error
    await page.route('**/api/routes', route => route.abort());
    await page.goto('/app/route');
    await expect(page.locator('[data-testid="error-message"]'))
      .toBeVisible();
    
    // Test invalid input
    await page.fill('[data-testid="distance-input"]', '-1');
    await expect(page.locator('[data-testid="validation-error"]'))
      .toBeVisible();
  }),

  // Performance Testing
  performance: test('measure critical metrics', async ({ page }) => {
    // Load testing
    const startTime = Date.now();
    await page.goto('/app');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
    
    // Interaction responsiveness
    await page.click('[data-testid="map-zoom-in"]');
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
  })
}; 