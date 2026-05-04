import { test, expect } from "@playwright/test"

test.describe("admin login page", () => {
  test("login form renders", async ({ page }) => {
    const response = await page.goto("/admin/login")
    expect(response?.status()).toBeLessThan(400)
    await expect(page.locator("input[type='email'], input[name*='email' i]").first()).toBeVisible()
    await expect(page.locator("input[type='password']").first()).toBeVisible()
  })

  test("forgot password page renders", async ({ page }) => {
    await page.goto("/admin/forgot-password")
    await expect(page.locator("input[type='email'], input[name*='email' i]").first()).toBeVisible()
  })
})

test.describe("admin auth gate (regression)", () => {
  // When backend is unreachable (no dev server / 401), admin pages must NOT
  // show dashboard content. This guards against the isAuthenticated() bug
  // where a Promise was treated as truthy and the dashboard rendered anyway.
  test("unauthenticated /admin bounces to /admin/login", async ({ page }) => {
    // Stub /api/admin/auth/me to simulate unauthenticated state
    await page.route(/\/api\/admin\/auth\/me/, (route) =>
      route.fulfill({ status: 401, contentType: "application/json", body: "{}" }),
    )

    await page.goto("/admin")
    await page.waitForURL(/\/admin\/login/, { timeout: 5_000 })
    expect(page.url()).toMatch(/\/admin\/login/)
  })

  test("unauthenticated /admin/dashboard bounces to /admin/login", async ({ page }) => {
    await page.route(/\/api\/admin\/auth\/me/, (route) =>
      route.fulfill({ status: 401, contentType: "application/json", body: "{}" }),
    )

    await page.goto("/admin/dashboard")
    await page.waitForURL(/\/admin\/login/, { timeout: 5_000 })
    expect(page.url()).toMatch(/\/admin\/login/)
  })

  test("backend unreachable: /admin still bounces to login (no dashboard leak)", async ({
    page,
  }) => {
    // Simulate network failure
    await page.route(/\/api\/admin\/auth\/me/, (route) => route.abort("failed"))

    await page.goto("/admin/dashboard")
    await page.waitForURL(/\/admin\/login/, { timeout: 5_000 })
    // Confirm no dashboard heading ever rendered
    await expect(page.getByText(/Good (morning|afternoon|evening)/)).toHaveCount(0)
  })
})
