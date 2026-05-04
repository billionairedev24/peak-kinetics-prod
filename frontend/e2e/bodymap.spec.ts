import { test, expect } from "@playwright/test"

test.describe("BodyMap", () => {
  test("renders on homepage", async ({ page }) => {
    await page.goto("/")
    const svg = page.locator("svg").first()
    await expect(svg).toBeVisible()
  })

  test("hotspot click reveals a detail card", async ({ page }) => {
    await page.goto("/")
    // Scroll BodyMap into view (badge label is "Body Map")
    const bodyMapSvg = page.getByLabel(/body map, .* view/i).first()
    await bodyMapSvg.scrollIntoViewIfNeeded()

    // Click the first hotspot on the silhouette
    const hotspot = bodyMapSvg.locator("g.cursor-pointer").first()
    await expect(hotspot).toBeVisible()
    await hotspot.click()

    // After click, a "View Recovery Program" CTA should appear in the detail card
    await expect(page.getByRole("link", { name: /view recovery program/i })).toBeVisible({
      timeout: 5_000,
    })
  })
})
