import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, waitFor, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "@/test/utils"
import LoginPage from "./LoginPage"

const mockLogin = vi.fn()
const mockLoginGoogle = vi.fn()

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ login: mockLogin, loginWithGoogle: mockLoginGoogle, user: null, loading: false }),
}))

describe("LoginPage", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("renders all form fields and the submit button", () => {
    renderWithProviders(<LoginPage />)
    expect(screen.getByPlaceholderText("tu@correo.com")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it("shows validation errors for empty submit", async () => {
    renderWithProviders(<LoginPage />)
    await userEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }))
    expect(await screen.findByText("Correo inválido")).toBeInTheDocument()
    expect(await screen.findByText("Mínimo 6 caracteres")).toBeInTheDocument()
  })

  it("shows error for invalid email format", async () => {
    renderWithProviders(<LoginPage />)
    const emailInput = screen.getByPlaceholderText("tu@correo.com")
    await userEvent.type(emailInput, "not-an-email")
    fireEvent.submit(emailInput.closest("form")!)
    expect(await screen.findByText("Correo inválido")).toBeInTheDocument()
  })

  it("calls login() with correct credentials on valid submit", async () => {
    mockLogin.mockResolvedValue(undefined)
    renderWithProviders(<LoginPage />)
    await userEvent.type(screen.getByPlaceholderText("tu@correo.com"), "user@test.com")
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "password123")
    await userEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }))
    await waitFor(() => { expect(mockLogin).toHaveBeenCalledWith("user@test.com", "password123") })
  })

  it("shows error message when login fails", async () => {
    mockLogin.mockRejectedValue(new Error("auth/wrong-password"))
    renderWithProviders(<LoginPage />)
    await userEvent.type(screen.getByPlaceholderText("tu@correo.com"), "user@test.com")
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "wrongpass")
    await userEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }))
    expect(await screen.findByText(/correo o contraseña incorrectos/i)).toBeInTheDocument()
  })

  it("toggles password visibility", async () => {
    renderWithProviders(<LoginPage />)
    const input = screen.getByPlaceholderText("••••••••") as HTMLInputElement
    expect(input.type).toBe("password")
    const visBtn = screen.getByRole("button", { name: /visibility/i })
    await userEvent.click(visBtn)
    expect(input.type).toBe("text")
    await userEvent.click(visBtn)
    expect(input.type).toBe("password")
  })

  it("calls loginWithGoogle when Google button is clicked", async () => {
    mockLoginGoogle.mockResolvedValue(undefined)
    renderWithProviders(<LoginPage />)
    await userEvent.click(screen.getByRole("button", { name: /google/i }))
    await waitFor(() => { expect(mockLoginGoogle).toHaveBeenCalledOnce() })
  })

  it("shows link to register page", () => {
    renderWithProviders(<LoginPage />)
    expect(screen.getByRole("link", { name: /regístrate/i })).toBeInTheDocument()
  })
})