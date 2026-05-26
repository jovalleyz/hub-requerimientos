import "@testing-library/jest-dom"
import { vi, afterEach } from "vitest"
import { cleanup } from "@testing-library/react"

afterEach(() => { cleanup() })

vi.mock("@/services/firebase", () => ({
  db: {}, auth: { currentUser: null }, storage: {},
}))

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test-id" }) }
})

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false, media: query, onchange: null,
    addListener: vi.fn(), removeListener: vi.fn(),
    addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
  })),
})

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn(),
}))