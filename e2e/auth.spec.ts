import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
  test("landing redirects to /login", async ({ page }) => {
    await page.goto("/"); await expect(page).toHaveURL(/\/login/)
  })
  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login")
    await expect(page.getByText("InsurTech Pro")).toBeVisible()
    await expect(page.getByPlaceholder("tu@correo.com")).toBeVisible()
    await expect(page.getByPlaceholder("••••••••")).toBeVisible()
    await expect(page.getByRole("button", { name: /iniciar sesión/i })).toBeVisible()
    await expect(page.getByRole("button", { name: /google/i })).toBeVisible()
  })
  test("shows validation errors when submitting empty form", async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("button", { name: /iniciar sesión/i }).click()
    await expect(page.getByText("Correo inválido")).toBeVisible()
    await expect(page.getByText("Mínimo 6 caracteres")).toBeVisible()
  })
  test("shows error for invalid email format", async ({ page }) => {
    await page.goto("/login")
    await page.getByPlaceholder("tu@correo.com").fill("not-an-email")
    await page.getByPlaceholder("••••••••").fill("password123")
    await page.getByRole("button", { name: /iniciar sesión/i }).click()
    await expect(page.getByText("Correo inválido")).toBeVisible()
  })
  test("password visibility toggle works", async ({ page }) => {
    await page.goto("/login")
    const passInput = page.getByPlaceholder("••••••••")
    await expect(passInput).toHaveAttribute("type", "password")
    await page.getByRole("button", { name: /visibility/i }).click()
    await expect(passInput).toHaveAttribute("type", "text")
  })
  test("register link navigates to /register", async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("link", { name: /regístrate/i }).click()
    await expect(page).toHaveURL(/\/register/)
  })
  test.skip("successful login redirects to /dashboard", async ({ page }) => {
    await page.goto("/login")
    await page.getByPlaceholder("tu@correo.com").fill(process.env.E2E_USER ?? "")
    await page.getByPlaceholder("••••••••").fill(process.env.E2E_PASS ?? "")
    await page.getByRole("button", { name: /iniciar sesión/i }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 })
  })
})