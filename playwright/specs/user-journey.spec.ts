import { test, expect } from '@playwright/test'

test.describe('Core User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('complete route planning journey', async ({ page }) => {
    // Login
    await page.click('text=Sign In')
    await page.fill('[name=email]', process.env.TEST_USER_EMAIL || 'test@example.com')
    await page.fill('[name=password]', process.env.TEST_USER_PASSWORD || 'password123')
    await page.click('button[type=submit]')
    
    // Navigate to route planner
    await page.click('text=Route Planner')
    await expect(page).toHaveURL(/.*route-planner/)
    
    // Create route
    await page.click('text=Create Route')
    await page.fill('[name=route-name]', 'Test Route')
    
    // Add waypoints by clicking on map
    await page.click('#map', { position: { x: 100, y: 100 } })
    await page.click('#map', { position: { x: 200, y: 200 } })
    
    // Save route
    await page.click('text=Save Route')
    await expect(page.locator('.route-list')).toContainText('Test Route')
    
    // Check weather widget
    await expect(page.locator('.weather-widget')).toBeVisible()
    
    // Verify route appears in saved routes
    await page.click('text=Saved Routes')
    await expect(page.locator('.route-card')).toContainText('Test Route')
  })

  test('explore POIs along route', async ({ page }) => {
    // Login and navigate to route
    await test.step('Login', async () => {
      await page.click('text=Sign In')
      await page.fill('[name=email]', process.env.TEST_USER_EMAIL || 'test@example.com')
      await page.fill('[name=password]', process.env.TEST_USER_PASSWORD || 'password123')
      await page.click('button[type=submit]')
    })
    
    await test.step('Navigate to POI Explorer', async () => {
      await page.click('text=POI Explorer')
      await expect(page).toHaveURL(/.*poi-explorer/)
    })
    
    // Search for POIs
    await page.fill('[name=poi-search]', 'coffee')
    await page.click('text=Search')
    
    // Verify POI results
    await expect(page.locator('.poi-list')).toBeVisible()
    await expect(page.locator('.poi-card')).toHaveCount(5)
    
    // Add POI to route
    await page.click('.poi-card >> text=Add to Route')
    await expect(page.locator('.route-poi-list')).toContainText('coffee')
  })

  test('use AI chat for route suggestions', async ({ page }) => {
    // Login
    await test.step('Login', async () => {
      await page.click('text=Sign In')
      await page.fill('[name=email]', process.env.TEST_USER_EMAIL || 'test@example.com')
      await page.fill('[name=password]', process.env.TEST_USER_PASSWORD || 'password123')
      await page.click('button[type=submit]')
    })
    
    // Open AI chat
    await page.click('text=AI Assistant')
    
    // Ask for route suggestion
    await page.fill('.ai-chat-input', 'Suggest a scenic route near New York')
    await page.click('text=Send')
    
    // Verify response
    await expect(page.locator('.ai-chat-response')).toContainText('Here\'s a scenic route')
    await expect(page.locator('.suggested-route')).toBeVisible()
  })
}) 