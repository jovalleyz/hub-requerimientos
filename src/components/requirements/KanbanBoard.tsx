import { useState, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import type { Requirement, RequirementStatus } from "@/types"
import { useRequirements, useUpdateRequirementStatus } from "@/hooks/useRequirements"
import KanbanColumn from "./KanbanColumn"
import RequirementCard from "./RequirementCard"

const COLUMN_ORDER: RequirementStatus[] = [
  "BACKLOG",
  "ANALYSIS",
  "IN_PROGRESS",
  "REVIEW",
  "COMPLETED",
]

interface KanbanBoardProps {
  search: string
  priorityFilter: string
  productFilter: string
}

export default function KanbanBoard({ search, priorityFilter, productFilter }: KanbanBoardProps) {
  const navigate = useNavigate()
  const { data: requirements = [], isLoading, isError } = useRequirements()
  const updateStatus = useUpdateRequirementStatus()

  const [activeReq, setActiveReq] = useState<Requirement | null>(null)
  const [localOrder, setLocalOrder] = useState<Record<string, string[]>>({})

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  )

  // Filter requirements
  const filtered = useMemo(() => {
    return requirements.filter((r) => {
      if (
        search &&
        !r.title.toLowerCase().includes(search.toLowerCase()) &&
        !(r as Requirement & { code?: string }).code?.toLowerCase().includes(search.toLowerCase())
      ) return false
      if (priorityFilter && r.priority !== priorityFilter) return false
      if (productFilter && r.productLine !== productFilter) return false
      return true
    })
  }, [requirements, search, priorityFilter, productFilter])

  // Group by status, respecting local drag order
  const columns = useMemo(() => {
    const groups: Record<RequirementStatus, Requirement[]> = {
      BACKLOG: [], ANALYSIS: [], IN_PROGRESS: [], REVIEW: [], COMPLETED: [], CANCELLED: [],
    }
    for (const req of filtered) {
      const st = req.status as RequirementStatus
      if (groups[st]) groups[st].push(req)
    }
    // Apply local ordering overrides
    for (const [status, ids] of Object.entries(localOrder)) {
      const st = status as RequirementStatus
      if (!groups[st]) continue
      const idSet = new Set(ids)
      groups[st] = [
        ...ids.map((id) => groups[st].find((r) => r.id === id)).filter(Boolean) as Requirement[],
        ...groups[st].filter((r) => !idSet.has(r.id)),
      ]
    }
    return groups
  }, [filtered, localOrder])

  const findStatus = useCallback((id: string): RequirementStatus | null => {
    for (const status of COLUMN_ORDER) {
      if (columns[status].some((r) => r.id === id)) return status
    }
    return null
  }, [columns])

  const handleDragStart = useCallback(({ active }: DragStartEvent) => {
    const req = filtered.find((r) => r.id === active.id)
    setActiveReq(req ?? null)
  }, [filtered])

  const handleDragEnd = useCallback(({ active, over }: DragEndEvent) => {
    setActiveReq(null)
    if (!over) return

    const activeId = active.id as string
    const overId   = over.id as string

    const sourceStatus = findStatus(activeId)
    // over.id can be a column status or a card id
    const targetStatus: RequirementStatus = (COLUMN_ORDER as string[]).includes(overId)
      ? (overId as RequirementStatus)
      : (findStatus(overId) ?? sourceStatus!)

    if (!sourceStatus || !targetStatus) return

    if (sourceStatus === targetStatus) {
      // Reorder within column
      const col      = columns[sourceStatus]
      const oldIndex = col.findIndex((r) => r.id === activeId)
      const newIndex = col.findIndex((r) => r.id === overId)
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        setLocalOrder((prev) => ({
          ...prev,
          [sourceStatus]: arrayMove(col.map((r) => r.id), oldIndex, newIndex),
        }))
      }
    } else {
      // Move to new column — fire mutation
      updateStatus.mutate({ id: activeId, status: targetStatus })
      // Optimistic local update
      setLocalOrder((prev) => {
        const srcIds = (prev[sourceStatus] ?? columns[sourceStatus].map((r) => r.id))
          .filter((id) => id !== activeId)
        const tgtIds = [
          activeId,
          ...(prev[targetStatus] ?? columns[targetStatus].map((r) => r.id)),
        ]
        return { ...prev, [sourceStatus]: srcIds, [targetStatus]: tgtIds }
      })
    }
  }, [findStatus, columns, updateStatus])

  if (isLoading) {
    return (
      <div className="flex gap-4">
        {COLUMN_ORDER.map((s) => (
          <div key={s} className="min-w-[300px] w-[300px] shrink-0">
            <div className="h-6 w-32 rounded-full bg-[var(--color-surface-variant)] animate-pulse mb-3" />
            {[1, 2].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-[var(--color-surface-variant)] animate-pulse mb-3" />
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-[var(--color-error)]">
        <span className="material-symbols-outlined text-[48px] mb-2">error</span>
        <p className="text-body-md">Error cargando requerimientos</p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-6 min-h-[calc(100vh-260px)]">
        {COLUMN_ORDER.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            requirements={columns[status]}
            onCardClick={r => navigate("/requirements/" + r.id)}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
        {activeReq ? (
          <div style={{ transform: "rotate(3deg) scale(1.05)", opacity: 0.95 }}>
            <RequirementCard requirement={activeReq} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

