import { test, expect } from '@playwright/test';

test.describe('Route Visualization Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Storybook
    await page.goto('http://localhost:6006');
  });

  test('Main Route Visualization Components', async ({ page }) => {
    // Test MapView stories
    await page.goto('http://localhost:6006/iframe.html?id=components-mapview--default');
    await expect(page).toHaveScreenshot('mapview-default.png');

    await page.goto('http://localhost:6006/iframe.html?id=components-mapview--with-tributaries');
    await expect(page).toHaveScreenshot('mapview-with-tributaries.png');

    // Test RouteVisualization sidebar stories
    await page.goto('http://localhost:6006/iframe.html?id=components-route-routevisualization--default');
    await expect(page).toHaveScreenshot('route-visualization-default.png');

    await page.goto('http://localhost:6006/iframe.html?id=components-route-routevisualization--with-selected-tributary');
    await expect(page).toHaveScreenshot('route-visualization-selected.png');
  });

  test('Composite Route Creation Flow', async ({ page }) => {
    // Test the combined view
    await page.goto('http://localhost:6006/iframe.html?id=composite-routecreation--river-and-tributaries');
    await expect(page).toHaveScreenshot('composite-river-tributaries.png');

    // Test interactions
    const tributaryButton = page.locator('button:has-text("Scenic Mountain Loop")');
    await tributaryButton.click();
    await expect(page).toHaveScreenshot('composite-tributary-selected.png');

    const poiButton = page.locator('button:has-text("Mountain Overlook")');
    await poiButton.click();
    await expect(page).toHaveScreenshot('composite-poi-selected.png');
  });

  test('Visual States and Interactions', async ({ page }) => {
    await page.goto('http://localhost:6006/iframe.html?id=composite-routecreation--river-and-tributaries');

    // Test hover states
    await page.hover('button:has-text("Historic District Path")');
    await expect(page).toHaveScreenshot('hover-tributary.png');

    // Test empty state
    await page.goto('http://localhost:6006/iframe.html?id=composite-routecreation--empty-route');
    await expect(page).toHaveScreenshot('empty-route.png');
  });

  test('Responsive Layout Tests', async ({ page }) => {
    await page.goto('http://localhost:6006/iframe.html?id=composite-routecreation--river-and-tributaries');

    // Test different viewport sizes
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page).toHaveScreenshot('responsive-desktop.png');

    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page).toHaveScreenshot('responsive-tablet.png');

    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page).toHaveScreenshot('responsive-mobile.png');
  });
}); 