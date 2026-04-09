"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHref = any

export function BottomNav() {
  const pathname = usePathname()

  // Detectar contexto: admin torneo, admin general, o torneo público
  const adminTorneoMatch = pathname.match(/^\/admin\/torneo\/([^/]+)/)
  const adminTorneoId = adminTorneoMatch?.[1]

  const torneoMatch = pathname.match(/\/torneos\/([^/]+)/)
  const torneoId = torneoMatch?.[1]

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
        { href: `/torneos/${torneoId}`,         icon: "home",           label: "Torneo"  },
        { href: `/torneos/${torneoId}/fixture`,  icon: "calendar_today", label: "Fixture" },
        { href: `/torneos/${torneoId}/tabla`,    icon: "leaderboard",    label: "Tabla"   },
        { href: `/torneos/${torneoId}/llaves`,   icon: "account_tree",   label: "Llaves"  },
      ]
    : [
        { href: "/torneos", icon: "home", label: "Torneos" },
      ]

  const isActive = (href: string) => {
    // Exact match para raíces de sección
    if (href === `/torneos/${torneoId}`) return pathname === href
    if (href === `/admin/torneo/${adminTorneoId}`) return pathname === href
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  return (
    <nav style={{
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: 430,
      display: "flex",
      justifyContent: "space-around",
      padding: "6px 6px 22px",
      background: "rgba(255,255,255,0.92)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderTop: "1px solid #e2e8f0",
      zIndex: 100,
      borderRadius: "24px 24px 0 0",
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
              gap: 1,
              background: active ? "rgba(188,255,0,0.12)" : "transparent",
              borderRadius: 12,
              padding: "5px 20px",
              cursor: "pointer",
              textDecoration: "none",
              minWidth: 64,
              // Emil: no transition en nav — se usa constantemente en mobile
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span style={{
              fontFamily: "'Material Symbols Outlined'",
              fontVariationSettings: `'FILL' ${active ? 1 : 0}, 'wght' 400`,
              fontSize: 22,
              color: active ? "#bcff00" : "#64748b",
              lineHeight: 1,
            }}>
              {it.icon}
            </span>
            <span style={{
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: active ? "#bcff00" : "#64748b",
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
