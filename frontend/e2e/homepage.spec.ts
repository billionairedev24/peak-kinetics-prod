import { test, expect } from "@playwright/test"

test.describe("homepage", () => {
  test("loads and shows the brand", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/peak kinetics/i)
    // Brand text appears somewhere on the landing page
    await expect(page.locator("body")).toContainText(/peak kinetics/i)
  })

  test("has a working navigation header", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" })
    const header = page.locator("header").first()
    await expect(header).toBeVisible({ timeout: 10_000 })
  })

  test("contact section is reachable", async ({ page }) => {
    await page.goto("/")
    // Contact section is rendered on the homepage
    const messageField = page
      .locator("textarea, input[name*='message' i], [placeholder*='message' i]")
      .first()
    await expect(messageField).toBeVisible({ timeout: 10_000 })
  })
})
