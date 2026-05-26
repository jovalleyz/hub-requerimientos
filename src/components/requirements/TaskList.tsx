import { useState, useRef } from "react"
import type { RequirementTask } from "@/types"
import { useTasks, useAddTask, useToggleTask, useDeleteTask } from "@/hooks/useRequirementDetail"

interface Props { reqId: string }

function TaskRow({ task, reqId }: { task: RequirementTask; reqId: string }) {
  const toggle = useToggleTask(reqId)
  const remove = useDeleteTask(reqId)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--color-surface-container-low)] transition-colors group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Checkbox */}
      <button
        onClick={() => toggle.mutate({ taskId: task.id, completed: !task.completed })}
        className="shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
        style={{
          borderColor: task.completed ? "var(--color-success)" : "var(--color-outline)",
          background: task.completed ? "var(--color-success)" : "transparent",
        }}
      >
        {task.completed && (
          <span className="material-symbols-outlined text-white text-[12px]">check</span>
        )}
      </button>

      {/* Title */}
      <span
        className="flex-1 text-body-md"
        style={{
          color: task.completed ? "var(--color-on-surface-variant)" : "var(--color-on-surface)",
          textDecoration: task.completed ? "line-through" : "none",
        }}
      >
        {task.title}
      </span>

      {/* Due date */}
      {task.dueDate && (
        <span className="text-label-sm text-[var(--color-on-surface-variant)] shrink-0">
          {new Date(task.dueDate).toLocaleDateString("es-DO", { day: "2-digit", month: "short" })}
        </span>
      )}

      {/* Delete — visible on hover */}
      {hovered && (
        <button
          onClick={() => remove.mutate(task.id)}
          className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
          disabled={remove.isPending}
        >
          <span className="material-symbols-outlined text-[18px] text-[var(--color-error)]">delete</span>
        </button>
      )}
    </div>
  )
}

export default function TaskList({ reqId }: Props) {
  const { data: tasks = [], isLoading } = useTasks(reqId)
  const addTask = useAddTask(reqId)
  const [newTitle, setNewTitle] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const pending   = tasks.filter(t => !t.completed)
  const completed = tasks.filter(t => t.completed)
  const pct       = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0

  function handleAdd() {
    const t = newTitle.trim()
    if (!t) return
    addTask.mutate({ title: t })
    setNewTitle("")
    inputRef.current?.focus()
  }

  return (
    <div>
      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="mb-5">
          <div className="flex justify-between text-label-sm text-[var(--color-on-surface-variant)] mb-1.5">
            <span>{completed.length} de {tasks.length} completadas</span>
            <span className="font-semibold">{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--color-surface-container)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: pct === 100 ? "var(--color-success)" : "var(--color-secondary)",
              }}
            />
          </div>
        </div>
      )}

      {/* Add task input */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] focus-within:border-[var(--color-primary)] transition-colors">
          <span className="material-symbols-outlined text-[18px] text-[var(--color-outline)]">add_task</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Nueva tarea…"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            className="flex-1 bg-transparent text-body-md text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)] outline-none"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={!newTitle.trim() || addTask.isPending}
          className="px-4 py-2 rounded-xl text-white text-label-md font-medium disabled:opacity-40 transition-all active:scale-95"
          style={{ background: "var(--color-primary)" }}
        >
          {addTask.isPending ? "…" : "Agregar"}
        </button>
      </div>

      {/* Task list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 rounded-xl bg-[var(--color-surface-container)] animate-pulse" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-10 text-[var(--color-on-surface-variant)]">
          <span className="material-symbols-outlined text-[40px] opacity-30 block mb-2">checklist</span>
          <p className="text-body-md">Sin tareas aún — agrega la primera</p>
        </div>
      ) : (
        <div>
          <div className="space-y-0.5">
            {pending.map(t => <TaskRow key={t.id} task={t} reqId={reqId} />)}
          </div>
          {completed.length > 0 && (
            <div className="mt-4">
              <p className="text-label-sm text-[var(--color-on-surface-variant)] px-3 mb-1">Completadas</p>
              <div className="space-y-0.5 opacity-60">
                {completed.map(t => <TaskRow key={t.id} task={t} reqId={reqId} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
