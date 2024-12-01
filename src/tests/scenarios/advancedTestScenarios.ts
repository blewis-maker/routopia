import { test, expect } from '@playwright/test';
import { testData } from '../data/testData';

export const advancedScenarios = {
  // Accessibility Testing
  accessibility: test('verify accessibility standards', async ({ page }) => {
    await page.goto('/');
    const violations = await page.evaluate(async () => {
      // Run axe-core
      const { axe } = await import('axe-core');
      return await axe(document);
    });
    expect(violations.length).toBe(0);
  }),

  // Responsive Design
  responsive: test.describe('responsive layouts', () => {
    const viewports = [
      { width: 320, height: 568 },  // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1440, height: 900 }  // Desktop
    ];

    for (const viewport of viewports) {
      test(`layout at ${viewport.width}x${viewport.height}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto('/app');
        // Verify layout adjustments
        const layout = await page.evaluate(() => {
          return {
            leftPanelVisible: window.getComputedStyle(
              document.querySelector('.left-panel')!
            ).display !== 'none',
            rightPanelVisible: window.getComputedStyle(
              document.querySelector('.right-panel')!
            ).display !== 'none'
          };
        });
        expect(layout).toMatchSnapshot(`layout-${viewport.width}.png`);
      });
    }
  }),

  // State Management
  stateManagement: test('verify store interactions', async ({ page }) => {
    await page.goto('/app');
    
    // Test activity state
    await page.click('[data-testid="activity-selector"]');
    await page.click('[data-testid="activity-hiking"]');
    const activityState = await page.evaluate(() => {
      return window.__STORE__.getState().activity;
    });
    expect(activityState.currentActivity).toBe('hiking');

    // Test real-time updates
    await page.evaluate(() => {
      window.__STORE__.dispatch({ 
        type: 'realTime/updateWeather',
        payload: testData.weather
      });
    });
    const realTimeState = await page.evaluate(() => {
      return window.__STORE__.getState().realTime;
    });
    expect(realTimeState.weather).toEqual(testData.weather);
  }),

  // Integration Testing
  integration: test('verify component integration', async ({ page }) => {
    await page.goto('/app/route');
    
    // Test route creation flow
    await page.fill('[data-testid="location-search"]', 'Mountain Trail');
    await page.click('[data-testid="search-submit"]');
    await page.click('[data-testid="activity-hiking"]');
    await page.click('[data-testid="generate-route"]');

    // Verify integrated components
    await expect(page.locator('[data-testid="route-map"]')).toBeVisible();
    await expect(page.locator('[data-testid="elevation-profile"]')).toBeVisible();
    await expect(page.locator('[data-testid="weather-overlay"]')).toBeVisible();
    await expect(page.locator('[data-testid="poi-markers"]')).toBeVisible();
  })
}; 