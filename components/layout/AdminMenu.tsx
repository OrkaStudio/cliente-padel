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
    sub: "Acceso veedor",
  },
  {
    slug: "mas-padel",
    nombre: "Más Pádel",
    logo: "/clubes/mas-padel.logo.png",
    href: "/veedor/mas-padel",
    sub: "Acceso veedor",
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
          background: "#fff",
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <span style={{
          fontFamily: "'Material Symbols Outlined'",
          fontSize: 15,
          color: "#64748b",
          lineHeight: 1,
        }}>
          manage_accounts
        </span>
        <span style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#0f172a",
        }}>
          Acceso
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          style={{
            fontFamily: "'Material Symbols Outlined'",
            fontSize: 14,
            color: "#94a3b8",
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
            {/* Backdrop */}
            <div
              onClick={() => setOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 190 }}
            />

            {/* Dropdown — fixed para escapar stacking context del header */}
            <motion.div
              initial={{ opacity: 0, y: -8, filter: "blur(6px)", scale: 0.97 }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, y: -8, filter: "blur(6px)", scale: 0.97 }}
              transition={{ type: "spring", stiffness: 340, damping: 24 }}
              style={{
                position: "fixed",
                top: 56,
                right: 16,
                zIndex: 210,
                background: "#ffffff",
                borderRadius: 14,
                border: "1px solid #e2e8f0",
                padding: 8,
                minWidth: 210,
                boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              {/* Label veedores */}
              <p style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 9, fontWeight: 900, color: "#94a3b8",
                textTransform: "uppercase", letterSpacing: "0.08em",
                padding: "0 12px", marginBottom: 6,
              }}>
                Veedores de sede
              </p>

              {/* Veedores + Organizador */}
              {CLUBES.map((club, i) => (
                  <motion.button
                      key={club.slug}
                      onClick={() => { setOpen(false); router.push(club.href) }}
                      initial={{ opacity: 0, x: 8 }}
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
                      onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: "#f8fafc",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        overflow: "hidden", flexShrink: 0,
                        border: "1px solid #e2e8f0",
                      }}>
                        {club.logo && (
                          <Image src={club.logo} alt={club.nombre} width={32} height={32} style={{ objectFit: "contain" }} />
                        )}
                      </div>
                      <div>
                        <p style={{
                          fontFamily: "var(--font-space-grotesk), sans-serif",
                          fontSize: 12, fontWeight: 700, color: "#0f172a",
                          margin: 0,
                        }}>
                          {club.nombre}
                        </p>
                        <p style={{
                          fontFamily: "var(--font-space-grotesk), sans-serif",
                          fontSize: 10, color: "#94a3b8", margin: 0,
                        }}>
                          {club.sub}
                        </p>
                      </div>
                      <span style={{
                        fontFamily: "'Material Symbols Outlined'",
                        fontSize: 14, color: "#cbd5e1",
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
