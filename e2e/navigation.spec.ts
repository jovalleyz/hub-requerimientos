import { test, expect } from "@playwright/test"

test.describe("Public navigation", () => {
  test("/ redirects to /login", async ({ page }) => {
    await page.goto("/"); await expect(page).toHaveURL(/\/login/)
  })
  test("/dashboard redirects unauthenticated user to /login", async ({ page }) => {
    await page.goto("/dashboard"); await expect(page).toHaveURL(/\/login/)
  })
  test("login page has correct title", async ({ page }) => {
    await page.goto("/login"); await expect(page).toHaveTitle(/InsurTech Pro/)
  })
  test("footer links are present on login page", async ({ page }) => {
    await page.goto("/login")
    await expect(page.getByRole("link", { name: "Privacidad" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Términos" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Seguridad" })).toBeVisible()
  })
})