"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function TorneoAutoRefresh({ torneoId }: { torneoId: string }) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    let connected = false
    let fallback: ReturnType<typeof setInterval> | null = null

    const channel = supabase
      .channel(`torneo-${torneoId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "partidos", filter: `torneo_id=eq.${torneoId}` },
        () => router.refresh()
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          connected = true
          if (fallback) { clearInterval(fallback); fallback = null }
        }
        if ((status === "CHANNEL_ERROR" || status === "TIMED_OUT") && !connected) {
          if (!fallback) fallback = setInterval(() => router.refresh(), 10_000)
        }
      })

    return () => {
      supabase.removeChannel(channel)
      if (fallback) clearInterval(fallback)
    }
  }, [router, torneoId])

  return null
}
