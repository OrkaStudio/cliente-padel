"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

// Refresca la página del interclub cada 15 segundos para ver resultados en vivo
export function InterclubAutoRefresh() {
  const router = useRouter()

  useEffect(() => {
    const t = setInterval(() => router.refresh(), 15_000)
    return () => clearInterval(t)
  }, [router])

  return null
}
