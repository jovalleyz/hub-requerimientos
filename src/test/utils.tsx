import React from "react"
import { render, type RenderOptions } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter } from "react-router-dom"

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  })
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialEntries?: string[]
}

export function renderWithProviders(
  ui: React.ReactElement,
  { initialEntries = ["/"], ...options }: CustomRenderOptions = {},
) {
  const queryClient = createTestQueryClient()
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter initialEntries={initialEntries}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </MemoryRouter>
    )
  }
  return render(ui, { wrapper: Wrapper, ...options })
}

export { default as userEvent } from "@testing-library/user-event"
export * from "@testing-library/react"