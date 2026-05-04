import { test, expect } from "@playwright/test"

test("blog index page loads", async ({ page }) => {
  // Stub the backend list endpoint so this doesn't depend on a live API
  await page.route(/\/api\/blog/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [], total: 0 }),
    })
  })

  const response = await page.goto("/blog")
  expect(response?.status()).toBeLessThan(400)
  await expect(page.locator("body")).toBeVisible()
})

test("legal pages render", async ({ page }) => {
  for (const path of ["/privacy-policy", "/terms-of-service"]) {
    const response = await page.goto(path)
    expect(response?.status()).toBeLessThan(400)
    await expect(page.locator("body")).toContainText(/.+/)
  }
})
