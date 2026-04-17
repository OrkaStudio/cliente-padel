"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHref = any

export function BottomNav() {
  const pathname = usePathname()

  // Sin nav en la página raíz de torneos
  if (pathname === "/torneos") return null

  // Detectar contexto: admin torneo, admin general, o torneo público
  const adminTorneoMatch = pathname.match(/^\/admin\/torneo\/([^/]+)/)
  const adminTorneoId = adminTorneoMatch?.[1]?.includes("[") ? undefined : adminTorneoMatch?.[1]

  const torneoMatch = pathname.match(/\/torneos\/([^/]+)/)
  const torneoId = torneoMatch?.[1]?.includes("[") ? undefined : torneoMatch?.[1]

  const items = adminTorneoId
    ? [
        { href: `/admin/torneo/${adminTorneoId}`,             icon: "sports_tennis", label: "Monitor"       },
        { href: `/admin/torneo/${adminTorneoId}/fixture`,     icon: "edit_calendar", label: "Fixture"       },
        { href: `/admin/torneo/${adminTorneoId}/inscripcion`, icon: "person_add",    label: "Inscripciones" },
      ]
    : pathname.startsWith("/admin")
    ? [
        { href: "/admin",          icon: "dashboard", label: "Panel"    },
        { href: "/admin/jugadores", icon: "group",    label: "Jugadores" },
      ]
    : torneoId
    ? [
        { href: `/torneos/${torneoId}/interclub`, icon: "home",           label: "Torneo"  },
        { href: `/torneos/${torneoId}/fixture`,   icon: "calendar_today", label: "Fixture" },
      ]
    : [
        { href: "/torneos", icon: "home", label: "Torneos" },
      ]

  const isActive = (href: string) => {
    if (href === `/admin/torneo/${adminTorneoId}`) return pathname === href
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  return (
    <nav style={{
      position: "fixed",
      bottom: 24,
      left: "50%",
      transform: "translateX(-50%)",
      width: "calc(100% - 32px)",
      maxWidth: 400,
      display: "flex",
      justifyContent: "space-around",
      padding: "8px 6px",
      background: "rgba(15, 23, 42, 0.8)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      boxShadow: "0 16px 32px rgba(0,0,0,0.3)",
      zIndex: 100,
      borderRadius: "100px",
    }}>
      {items.map(it => {
        const active = isActive(it.href)
        return (
          <Link
            key={it.href}
            href={it.href as AnyHref}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              background: active ? "rgba(188,255,0,0.12)" : "transparent",
              borderRadius: 30, // Pill inner
              padding: "6px 16px",
              cursor: "pointer",
              textDecoration: "none",
              minWidth: 56,
              // Emil: no transition en nav mobile
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span style={{
              fontFamily: "'Material Symbols Outlined'",
              fontVariationSettings: `'FILL' ${active ? 1 : 0}, 'wght' 400`,
              fontSize: 22,
              color: active ? "#bcff00" : "#94a3b8",
              lineHeight: 1,
            }}>
              {it.icon}
            </span>
            <span style={{
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: active ? "#bcff00" : "#94a3b8",
              fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
            }}>
              {it.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
