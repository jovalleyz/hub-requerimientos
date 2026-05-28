import type { Requirement } from "@/types"

const STATUS_LABELS: Record<string, string> = {
  BACKLOG: "Backlog", ANALYSIS: "Análisis", IN_PROGRESS: "En progreso",
  REVIEW: "Revisión", COMPLETED: "Completado", CANCELLED: "Cancelado",
}
const PRIORITY_LABELS: Record<string, string> = {
  CRITICAL: "Crítico", HIGH: "Alto", MEDIUM: "Medio", LOW: "Bajo",
}

// ─── CSV ─────────────────────────────────────────────────────────────────────

export function exportCSV(requirements: Requirement[], tenantName: string) {
  const headers = ["Código","Título","Estado","Prioridad","Línea","Deadline","Costo","Creado","Actualizado"]
  const rows = requirements.map(r => [
    r.code ?? "",
    `"${r.title.replace(/"/g, '""')}"`,
    STATUS_LABELS[r.status] ?? r.status,
    PRIORITY_LABELS[r.priority] ?? r.priority,
    r.productLine,
    r.deadline ? new Date(r.deadline).toLocaleDateString("es-DO") : "",
    r.estimatedCost ?? "",
    new Date(r.createdAt).toLocaleDateString("es-DO"),
    new Date(r.updatedAt).toLocaleDateString("es-DO"),
  ])

  const csv = [headers, ...rows].map(row => row.join(",")).join("\r\n")
  download(`﻿${csv}`, `requerimientos_${tenantName}_${today()}.csv`, "text/csv;charset=utf-8;")
}

// ─── Excel (XLSX) ─────────────────────────────────────────────────────────────

export async function exportExcel(requirements: Requirement[], tenantName: string) {
  const { utils, writeFile } = await import("xlsx")

  const rows = requirements.map(r => ({
    "Código":       r.code ?? "",
    "Título":       r.title,
    "Estado":       STATUS_LABELS[r.status] ?? r.status,
    "Prioridad":    PRIORITY_LABELS[r.priority] ?? r.priority,
    "Línea":        r.productLine,
    "Deadline":     r.deadline ? new Date(r.deadline).toLocaleDateString("es-DO") : "",
    "Costo (DOP)":  r.estimatedCost ?? "",
    "Creado":       new Date(r.createdAt).toLocaleDateString("es-DO"),
    "Actualizado":  new Date(r.updatedAt).toLocaleDateString("es-DO"),
  }))

  const ws = utils.json_to_sheet(rows)
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, "Requerimientos")

  // Column widths
  ws["!cols"] = [8,40,14,10,12,12,12,12,12].map(w => ({ wch: w }))

  writeFile(wb, `requerimientos_${tenantName}_${today()}.xlsx`)
}

// ─── PDF (jsPDF) ──────────────────────────────────────────────────────────────

export async function exportPDF(requirements: Requirement[], tenantName: string) {
  const { default: jsPDF } = await import("jspdf")
  // @ts-expect-error — no official types for autoTable default
  const { default: autoTable } = await import("jspdf-autotable")

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })

  // Logo + header
  const logoUrl = `${location.origin}/logo-unit.png`
  try {
    const logoData = await toBase64(logoUrl)
    doc.addImage(logoData, "PNG", 14, 8, 28, 12)
  } catch { /* skip if not available */ }

  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(0, 88, 190)
  doc.text("Reporte de Requerimientos", 50, 15)

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100)
  doc.text(`${tenantName} · Generado: ${new Date().toLocaleDateString("es-DO", { dateStyle: "long" })}`, 50, 21)

  // KPI summary row
  const total     = requirements.length
  const completed = requirements.filter(r => r.status === "COMPLETED").length
  const inProg    = requirements.filter(r => ["IN_PROGRESS","ANALYSIS","REVIEW"].includes(r.status)).length
  const rate      = total > 0 ? Math.round((completed / total) * 100) : 0

  doc.setFontSize(9)
  doc.setTextColor(60)
  doc.text(`Total: ${total}   Completados: ${completed}   En proceso: ${inProg}   Conversión: ${rate}%`, 14, 30)

  // Table
  autoTable(doc, {
    startY: 35,
    head: [["#","Código","Título","Estado","Prioridad","Línea","Deadline","Costo (DOP)"]],
    body: requirements.map((r, i) => [
      i + 1,
      r.code ?? "",
      r.title,
      STATUS_LABELS[r.status] ?? r.status,
      PRIORITY_LABELS[r.priority] ?? r.priority,
      r.productLine,
      r.deadline ? new Date(r.deadline).toLocaleDateString("es-DO") : "",
      r.estimatedCost?.toLocaleString("es-DO") ?? "",
    ]),
    headStyles: { fillColor: [0, 88, 190], textColor: 255, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 248, 255] },
    columnStyles: { 2: { cellWidth: 70 } },
    margin: { left: 14, right: 14 },
  })

  // Footer
  const pageCount = (doc as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(160)
    doc.text(`UNIT S.A. · Confidencial · Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.getHeight() - 8)
  }

  doc.save(`requerimientos_${tenantName}_${today()}.pdf`)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().slice(0, 10)
}

function download(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement("a")
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

async function toBase64(url: string): Promise<string> {
  const res  = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror  = reject
    reader.readAsDataURL(blob)
  })
}
