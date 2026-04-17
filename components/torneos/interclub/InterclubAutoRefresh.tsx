"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function InterclubAutoRefresh() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    let connected = false
    let fallback: ReturnType<typeof setInterval> | null = null

    const channel = supabase
      .channel("interclub-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "interclub_partidos" },
        () => router.refresh()
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          connected = true
          if (fallback) { clearInterval(fallback); fallback = null }
        }
        if ((status === "CHANNEL_ERROR" || status === "TIMED_OUT") && !connected) {
          // Realtime no disponible — fallback a polling cada 10s
          if (!fallback) fallback = setInterval(() => router.refresh(), 10_000)
        }
      })

    return () => {
      supabase.removeChannel(channel)
      if (fallback) clearInterval(fallback)
    }
  }, [router])

  return null
}
