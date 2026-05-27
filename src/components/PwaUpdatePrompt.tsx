import { useState, useEffect } from "react"

export default function PwaUpdatePrompt() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return
    const handler = () => setShow(true)
    navigator.serviceWorker.addEventListener("controllerchange", handler)
    return () => navigator.serviceWorker.removeEventListener("controllerchange", handler)
  }, [])

  if (!show) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 bg-[var(--color-unit-navy)] text-white rounded-2xl shadow-xl text-body-sm animate-slide-up">
      <span className="material-symbols-outlined text-[20px]">system_update</span>
      <span>Nueva versión disponible</span>
      <button
        onClick={() => window.location.reload()}
        className="ml-1 px-3 py-1 bg-white text-[var(--color-unit-navy)] rounded-lg text-label-sm font-medium hover:bg-white/90 transition-colors"
      >
        Actualizar
      </button>
      <button
        onClick={() => setShow(false)}
        className="text-white/60 hover:text-white transition-colors"
        aria-label="Cerrar"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  )
}
