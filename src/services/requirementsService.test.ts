import { describe, it, expect } from "vitest"
import { buildDashboardMetrics } from "./requirementsService"
import type { Requirement } from "@/types"

function makeReq(overrides = {}): Requirement {
  return {
    id: "req-" + Math.random().toString(36).slice(2), tenantId: "tenant-1",
    title: "Test requirement", description: "Description",
    status: "BACKLOG", priority: "MEDIUM", productLine: "GENERAL",
    assignedTo: [], assigneeNames: [], createdBy: "user-1",
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    taskCount: 0, completedTaskCount: 0, ...overrides,
  }
}

describe("buildDashboardMetrics", () => {
  it("returns zero metrics for empty array", () => {
    const m = buildDashboardMetrics([])
    expect(m.totalRequirements).toBe(0); expect(m.completedLast7Days).toBe(0)
    expect(m.conversionRate).toBe(0); expect(m.urgentItems).toHaveLength(0)
  })
  it("counts total requirements", () => {
    expect(buildDashboardMetrics([makeReq(), makeReq(), makeReq()]).totalRequirements).toBe(3)
  })
  it("groups by status correctly", () => {
    const reqs = [makeReq({ status: "BACKLOG" }), makeReq({ status: "BACKLOG" }),
                  makeReq({ status: "IN_PROGRESS" }), makeReq({ status: "COMPLETED" })]
    const { requirementsByStatus } = buildDashboardMetrics(reqs)
    expect(requirementsByStatus.BACKLOG).toBe(2); expect(requirementsByStatus.IN_PROGRESS).toBe(1)
    expect(requirementsByStatus.COMPLETED).toBe(1); expect(requirementsByStatus.ANALYSIS).toBe(0)
  })
  it("counts completedLast7Days using updatedAt", () => {
    const recent = new Date(Date.now() - 2 * 86_400_000).toISOString()
    const old    = new Date(Date.now() - 10 * 86_400_000).toISOString()
    const reqs = [makeReq({ status: "COMPLETED", updatedAt: recent }),
                  makeReq({ status: "COMPLETED", updatedAt: recent }),
                  makeReq({ status: "COMPLETED", updatedAt: old })]
    const m = buildDashboardMetrics(reqs)
    expect(m.completedLast7Days).toBe(2); expect(m.completedLast30Days).toBe(3)
  })
  it("calculates conversionRate as 0 when nothing is in-progress", () => {
    expect(buildDashboardMetrics([makeReq({ status: "BACKLOG" })]).conversionRate).toBe(0)
  })
  it("calculates conversionRate correctly", () => {
    const reqs = [
      ...Array.from({ length: 4 }, () => makeReq({ status: "COMPLETED" })),
      ...Array.from({ length: 2 }, () => makeReq({ status: "IN_PROGRESS" })),
      makeReq({ status: "ANALYSIS" }), makeReq({ status: "REVIEW" }),
    ]
    expect(buildDashboardMetrics(reqs).conversionRate).toBe(50)
  })
  it("lists up to 5 CRITICAL non-completed items as urgentItems", () => {
    const reqs = [
      ...Array.from({ length: 7 }, () => makeReq({ priority: "CRITICAL", status: "IN_PROGRESS" })),
      makeReq({ priority: "CRITICAL", status: "COMPLETED" }),
      makeReq({ priority: "CRITICAL", status: "CANCELLED" }),
      makeReq({ priority: "HIGH", status: "IN_PROGRESS" }),
    ]
    const { urgentItems } = buildDashboardMetrics(reqs)
    expect(urgentItems).toHaveLength(5)
    urgentItems.forEach(r => { expect(r.priority).toBe("CRITICAL") })
  })
})