import { useRef, useState } from "react"
import type { ProjectDocument } from "@/services/projectDocumentService"
import { useProjectDocuments, useUploadProjectDocument, useDeleteProjectDocument } from "@/hooks/useProjectDocuments"

function fileIcon(type: string): string {
  if (type.startsWith("image/"))       return "image"
  if (type === "application/pdf")      return "picture_as_pdf"
  if (type.includes("spreadsheet") || type.includes("excel")) return "table_chart"
  if (type.includes("word") || type.includes("document"))     return "description"
  if (type.includes("zip") || type.includes("compressed"))    return "folder_zip"
  return "attach_file"
}

function fileSize(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function DocRow({ doc, projectId }: { doc: ProjectDocument; projectId: string }) {
  const remove = useDeleteProjectDocument(projectId)
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--color-surface-container-low)] transition-colors"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--color-surface-container)" }}>
        <span className="material-symbols-outlined text-[22px] text-[var(--color-secondary)]">{fileIcon(doc.type)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body-md text-[var(--color-on-surface)] font-medium truncate">{doc.name}</p>
        <p className="text-label-sm text-[var(--color-on-surface-variant)]">
          {fileSize(doc.size)} · {new Date(doc.uploadedAt).toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" })}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <a href={doc.url} target="_blank" rel="noreferrer"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--color-surface-container)] transition-colors" title="Descargar">
          <span className="material-symbols-outlined text-[18px] text-[var(--color-secondary)]">download</span>
        </a>
        {hovered && (
          <button onClick={() => remove.mutate({ docId: doc.id, storagePath: doc.storagePath })}
            disabled={remove.isPending}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--color-error-container)] transition-colors" title="Eliminar">
            <span className="material-symbols-outlined text-[18px] text-[var(--color-error)]">delete</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default function ProjectDocumentPanel({ projectId }: { projectId: string }) {
  const { data: docs = [], isLoading } = useProjectDocuments(projectId)
  const upload  = useUploadProjectDocument(projectId)
  const fileRef = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [dragging, setDragging] = useState(false)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setProgress(0)
    for (const file of Array.from(files)) {
      await upload.mutateAsync({ file, onProgress: pct => setProgress(pct) })
    }
    setProgress(null)
  }

  return (
    <div>
      <div
        className="mb-5 border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer"
        style={{
          borderColor: dragging ? "var(--color-primary)" : "var(--color-outline-variant)",
          background:  dragging ? "color-mix(in srgb, var(--color-primary) 6%, transparent)" : "transparent",
        }}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); void handleFiles(e.dataTransfer.files) }}
      >
        <span className="material-symbols-outlined text-[36px] block mb-2" style={{ color: dragging ? "var(--color-primary)" : "var(--color-outline)" }}>cloud_upload</span>
        <p className="text-body-sm text-[var(--color-on-surface-variant)]">
          Arrastra archivos o <span style={{ color: "var(--color-primary)" }}>haz clic</span>
        </p>
        <input ref={fileRef} type="file" multiple className="hidden" onChange={e => void handleFiles(e.target.files)} />
      </div>

      {progress !== null && (
        <div className="mb-4">
          <div className="flex justify-between text-label-sm text-[var(--color-on-surface-variant)] mb-1.5">
            <span>Subiendo…</span><span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--color-surface-container)] overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "var(--color-secondary)" }} />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-14 rounded-xl bg-[var(--color-surface-container)] animate-pulse" />)}</div>
      ) : docs.length === 0 ? (
        <div className="text-center py-6 text-[var(--color-on-surface-variant)]">
          <span className="material-symbols-outlined text-[36px] opacity-30 block mb-2">folder_open</span>
          <p className="text-body-sm">Sin documentos adjuntos</p>
        </div>
      ) : (
        <div className="space-y-1">{docs.map(d => <DocRow key={d.id} doc={d} projectId={projectId} />)}</div>
      )}
    </div>
  )
}
