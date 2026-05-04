import { test, expect } from "@playwright/test"

const SERVICE_PAGES = [
  "/services/orthopedic-therapy",
  "/services/pain-management",
  "/services/sports-rehabilitation",
  "/services/geriatric-care",
  "/services/wellness-program",
  "/services/movement-screening",
]

for (const path of SERVICE_PAGES) {
  test(`service page renders: ${path}`, async ({ page }) => {
    const response = await page.goto(path)
    expect(response?.status()).toBeLessThan(400)
    await expect(page.locator("h1, h2").first()).toBeVisible()
  })
}
