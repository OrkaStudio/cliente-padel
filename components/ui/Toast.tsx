"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"

interface ToastProps {
  message: string | null
  type?: "error" | "success"
  onDismiss: () => void
  duration?: number
}

export function Toast({ message, type = "error", onDismiss, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onDismiss, duration)
    return () => clearTimeout(t)
  }, [message, duration, onDismiss])

  const isError = type === "error"

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={onDismiss}
          style={{
            position: "fixed",
            bottom: 90,
            left: 16,
            right: 16,
            zIndex: 200,
            background: isError ? "#0f172a" : "#0f172a",
            borderLeft: `3px solid ${isError ? "#ef4444" : "#bcff00"}`,
            borderRadius: 10,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
            cursor: "pointer",
          }}
        >
          <span style={{
            fontFamily: "'Material Symbols Outlined'",
            fontSize: 18,
            lineHeight: 1,
            color: isError ? "#ef4444" : "#bcff00",
          }}>
            {isError ? "error" : "check_circle"}
          </span>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            flex: 1,
          }}>
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
