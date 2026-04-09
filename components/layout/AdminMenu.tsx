"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useRouter } from "next/navigation"
import Image from "next/image"

const CLUBES = [
  {
    slug: "voleando",
    nombre: "Voleando",
    logo: "/clubes/voleando.logo.png",
    href: "/veedor/voleando",
  },
  {
    slug: "mas-padel",
    nombre: "Más Pádel",
    logo: "/clubes/mas-padel.logo.png",
    href: "/veedor/mas-padel",
  },
]

export function AdminMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <div style={{ position: "relative" }}>
      {/* Botón principal */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: "6px 12px",
          background: open ? "#0f172a" : "#fff",
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
          transition: "background 160ms cubic-bezier(0.23,1,0.32,1), border-color 160ms cubic-bezier(0.23,1,0.32,1)",
          borderColor: open ? "#0f172a" : "#e2e8f0",
        }}
      >
        <span style={{
          fontFamily: "'Material Symbols Outlined'",
          fontSize: 15,
          color: open ? "#bcff00" : "#64748b",
          lineHeight: 1,
          transition: "color 160ms cubic-bezier(0.23,1,0.32,1)",
        }}>
          manage_accounts
        </span>
        <span style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: open ? "#fff" : "#0f172a",
          transition: "color 160ms cubic-bezier(0.23,1,0.32,1)",
        }}>
          Acceso
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          style={{
            fontFamily: "'Material Symbols Outlined'",
            fontSize: 14,
            color: open ? "#fff" : "#94a3b8",
            lineHeight: 1,
            display: "block",
          }}
        >
          expand_more
        </motion.span>
      </button>

      {/* Menú desplegable */}
      <AnimatePresence>
        {open && (
          <>
            <div
              onClick={() => setOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 40 }}
            />

            <motion.div
              initial={{ opacity: 0, y: -8, filter: "blur(8px)", scale: 0.95 }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, y: -8, filter: "blur(8px)", scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                zIndex: 50,
                background: "#0f172a",
                borderRadius: 14,
                border: "1px solid #1e293b",
                padding: 8,
                minWidth: 210,
                boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
                overflow: "hidden",
              }}
            >
              {/* Admin */}
              <motion.button
                onClick={() => { setOpen(false); router.push("/admin") }}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0, type: "spring", stiffness: 300, damping: 22 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  width: "100%", padding: "10px 12px",
                  borderRadius: 8, border: "none",
                  background: "rgba(188,255,0,0.08)",
                  cursor: "pointer", WebkitTapHighlightColor: "transparent",
                  textAlign: "left", marginBottom: 6,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(188,255,0,0.15)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(188,255,0,0.08)")}
              >
                <span style={{
                  fontFamily: "'Material Symbols Outlined'",
                  fontSize: 18, color: "#bcff00", lineHeight: 1,
                }}>
                  admin_panel_settings
                </span>
                <div>
                  <p style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 12, fontWeight: 900, color: "#fff",
                    margin: 0, letterSpacing: "0.02em",
                  }}>
                    Modo Admin
                  </p>
                  <p style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 10, color: "#64748b", margin: 0,
                  }}>
                    Cristián — Organizador
                  </p>
                </div>
              </motion.button>

              {/* Separador */}
              <div style={{
                height: 1, background: "#1e293b",
                margin: "2px 4px 8px",
              }} />

              {/* Label veedores */}
              <p style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 9, fontWeight: 900, color: "#475569",
                textTransform: "uppercase", letterSpacing: "0.08em",
                padding: "0 12px", marginBottom: 6,
              }}>
                Veedores de sede
              </p>

              {/* Clubes */}
              {CLUBES.map((club, i) => (
                <motion.button
                  key={club.slug}
                  onClick={() => { setOpen(false); router.push(club.href) }}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (i + 1) * 0.05, type: "spring", stiffness: 300, damping: 22 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%", padding: "8px 12px",
                    borderRadius: 8, border: "none",
                    background: "transparent",
                    cursor: "pointer", WebkitTapHighlightColor: "transparent",
                    textAlign: "left",
                    marginBottom: i < CLUBES.length - 1 ? 2 : 0,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Logo del club */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden", flexShrink: 0,
                    border: "1px solid #e2e8f0",
                  }}>
                    <Image
                      src={club.logo}
                      alt={club.nombre}
                      width={32}
                      height={32}
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                  <div>
                    <p style={{
                      fontFamily: "var(--font-space-grotesk), sans-serif",
                      fontSize: 12, fontWeight: 700, color: "#fff",
                      margin: 0,
                    }}>
                      {club.nombre}
                    </p>
                    <p style={{
                      fontFamily: "var(--font-space-grotesk), sans-serif",
                      fontSize: 10, color: "#64748b", margin: 0,
                    }}>
                      Acceso veedor
                    </p>
                  </div>
                  <span style={{
                    fontFamily: "'Material Symbols Outlined'",
                    fontSize: 14, color: "#334155",
                    marginLeft: "auto", lineHeight: 1,
                  }}>
                    chevron_right
                  </span>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
