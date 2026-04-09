"use client"

import { useTransition } from "react"
import { motion } from "motion/react"
import { cambiarEstadoTorneoAction } from "@/actions/partidos.actions"
import { useRouter } from "next/navigation"

export function EstadoTorneoButton({ torneoId, nextEstado, label }: {
  torneoId: string
  nextEstado: "inscripcion" | "en_curso" | "finalizado"
  label: string
}) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const handleClick = () => {
    startTransition(async () => {
      await cambiarEstadoTorneoAction({ torneoId, estado: nextEstado })
      router.refresh()
    })
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={pending}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.16, type: "spring", stiffness: 300, damping: 20 }}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "10px 16px", borderRadius: 8, border: "none",
        background: pending ? "#94a3b8" : "#0f172a",
        color: "#fff", cursor: pending ? "not-allowed" : "pointer",
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: 11, fontWeight: 900,
        letterSpacing: "0.04em", textTransform: "uppercase",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {pending ? "..." : `→ ${label}`}
    </motion.button>
  )
}
