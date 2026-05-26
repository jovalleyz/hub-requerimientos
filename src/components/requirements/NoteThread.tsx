import { useState, useRef, useEffect } from "react"
import type { RequirementNote } from "@/types"
import { useNotes, useAddNote } from "@/hooks/useRequirementDetail"

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
  const hue = name.charCodeAt(0) * 37 % 360
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `hsl(${hue},55%,42%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "white", fontSize: size * 0.36, fontWeight: 700,
    }}>{initials}</div>
  )
}

function NoteCard({ note }: { note: RequirementNote }) {
  const date = new Date(note.createdAt)
  const relative = (() => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000)
    if (diff < 60)   return "ahora"
    if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
    return date.toLocaleDateString("es-DO", { day: "2-digit", month: "short" })
  })()

  return (
    <div className="flex gap-3 group">
      <Avatar name={note.authorName} size={32} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-label-md font-semibold text-[var(--color-on-surface)]">
            {note.authorName}
          </span>
          <span className="text-label-sm text-[var(--color-on-surface-variant)]">{relative}</span>
        </div>
        <div
          className="tonal-card p-3 text-body-md text-[var(--color-on-surface)] whitespace-pre-wrap leading-relaxed"
          style={{ borderRadius: "4px 16px 16px 16px" }}
        >
          {note.content}
        </div>
      </div>
    </div>
  )
}

interface Props { reqId: string }

export default function NoteThread({ reqId }: Props) {
  const { data: notes = [], isLoading } = useNotes(reqId)
  const addNote = useAddNote(reqId)
  const [text, setText] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [notes.length])

  function handleSubmit() {
    const c = text.trim()
    if (!c) return
    addNote.mutate(c)
    setText("")
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Notes feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-surface-container)] animate-pulse shrink-0" />
              <div className="flex-1 h-16 rounded-2xl bg-[var(--color-surface-container)] animate-pulse" />
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-10 text-[var(--color-on-surface-variant)]">
          <span className="material-symbols-outlined text-[40px] opacity-30 block mb-2">chat_bubble</span>
          <p className="text-body-md">Sin notas — sé el primero en comentar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map(n => <NoteCard key={n.id} note={n} />)}
        </div>
      )}
      <div ref={bottomRef} />

      {/* Compose */}
      <div className="border-t border-[var(--color-outline-variant)] pt-4 mt-2">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && e.ctrlKey && handleSubmit()}
          placeholder="Escribe una nota… (Ctrl+Enter para enviar)"
          rows={3}
          className="w-full rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-4 py-3 text-body-md text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)] focus:outline-none focus:border-[var(--color-primary)] resize-none transition-colors"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || addNote.isPending}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-white text-label-md font-medium disabled:opacity-40 transition-all active:scale-95"
            style={{ background: "var(--color-primary)" }}
          >
            <span className="material-symbols-outlined text-[16px]">send</span>
            {addNote.isPending ? "Enviando…" : "Comentar"}
          </button>
        </div>
      </div>
    </div>
  )
}
