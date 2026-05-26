import { useMemo } from "react"
import { Gantt, type Task, ViewMode } from "gantt-task-react"
import "gantt-task-react/dist/index.css"
import type { Project } from "@/types"

interface Props {
  projects:  Project[]
  viewMode:  ViewMode
}

const PROJECT_COLORS: Record<Project["status"], string> = {
  active:    "#0058be",
  completed: "#1a7f1a",
  on_hold:   "#D97706",
  cancelled: "#ba1a1a",
}

function safeDateStr(iso: string | undefined, fallbackDays = 0): Date {
  if (iso) {
    const d = new Date(iso)
    if (!isNaN(d.getTime())) return d
  }
  const d = new Date()
  d.setDate(d.getDate() + fallbackDays)
  return d
}

export default function ProjectGantt({ projects, viewMode }: Props) {
  const tasks = useMemo<Task[]>(() => {
    const result: Task[] = []
    for (const p of projects) {
      if (p.phases.length === 0) continue

      const phaseStarts = p.phases.map(ph => safeDateStr(ph.startDate))
      const phaseEnds   = p.phases.map(ph => safeDateStr(ph.endDate, 30))
      const projStart   = new Date(Math.min(...phaseStarts.map(d => d.getTime())))
      const projEnd     = new Date(Math.max(...phaseEnds.map(d => d.getTime())))

      const color = PROJECT_COLORS[p.status]

      // Project row
      result.push({
        id:            p.id,
        type:          "project",
        name:          p.name,
        start:         projStart,
        end:           projEnd,
        progress:      p.phases.length
          ? Math.round(p.phases.reduce((s, ph) => s + ph.progress, 0) / p.phases.length)
          : 0,
        hideChildren:  false,
        styles: {
          backgroundColor:         color,
          backgroundSelectedColor: color,
          progressColor:           "#ffffff55",
          progressSelectedColor:   "#ffffff88",
        },
      })

      // Phase rows
      for (const ph of p.phases) {
        const s = safeDateStr(ph.startDate)
        const e = safeDateStr(ph.endDate, 7)
        if (e <= s) e.setDate(s.getDate() + 7)

        result.push({
          id:       ph.id,
          type:     "task",
          name:     ph.name,
          start:    s,
          end:      e,
          progress: ph.progress,
          project:  p.id,
          styles: {
            backgroundColor:
              ph.status === "completed" ? "#1a7f1a"
              : ph.status === "active"  ? "var(--color-secondary)"
              : "#44546f",
            progressColor: "#ffffff66",
          },
        })
      }
    }
    return result
  }, [projects])

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-[var(--color-on-surface-variant)]">
        <span className="material-symbols-outlined text-[40px] opacity-30 block mb-2">timeline</span>
        <p className="text-body-md">Agrega proyectos con fases para ver el Gantt</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl" style={{ fontSize: 13 }}>
      <Gantt
        tasks={tasks}
        viewMode={viewMode}
        locale="es"
        columnWidth={viewMode === ViewMode.Month ? 220 : viewMode === ViewMode.Week ? 160 : 60}
        listCellWidth="180px"
        rowHeight={40}
        headerHeight={52}
        ganttHeight={Math.min(tasks.length * 40 + 60, 520)}
        barCornerRadius={6}
        barFill={72}
        todayColor="color-mix(in srgb, var(--color-primary) 12%, transparent)"
      />
    </div>
  )
}
