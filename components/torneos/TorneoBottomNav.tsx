"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHref = any

interface Props {
  torneoId: string
  tipo: string
  hasPlayoffs: boolean
}

export function TorneoBottomNav({ torneoId, tipo, hasPlayoffs }: Props) {
  const pathname = usePathname()

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href || pathname === href + "/"
    return pathname.startsWith(href)
  }

  if (tipo === "interclub") {
    const items = [
      { href: `/torneos/${torneoId}/interclub`, icon: "home",           label: "Torneo"  },
      { href: `/torneos/${torneoId}/fixture`,   icon: "calendar_today", label: "Fixture" },
    ]
    return <NavPill items={items} isActive={isActive} />
  }

  // Torneo regular
  const base = `/torneos/${torneoId}`
  const items: NavItem[] = [
    { href: base,                icon: "home",           label: "Inicio",  exact: true },
    { href: `${base}/fixture`,   icon: "calendar_today", label: "Fixture"              },
    { href: `${base}/tabla`,     icon: "bar_chart",      label: "Tabla"                },
    {
      href:     `${base}/llaves`,
      icon:     "account_tree",
      label:    "Llaves",
      disabled: !hasPlayoffs,
      tooltip:  "Disponible cuando comiencen los playoffs",
    },
  ]
  return <NavPill items={items} isActive={isActive} />
}

// ── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  href:     string
  icon:     string
  label:    string
  exact?:   boolean
  disabled?: boolean
  tooltip?:  string
}

// ── NavPill ──────────────────────────────────────────────────────────────────

function NavPill({
  items,
  isActive,
}: {
  items: NavItem[]
  isActive: (href: string, exact?: boolean) => boolean
}) {
  return (
    <nav style={{
      position:   "fixed",
      bottom:     24,
      left:       "50%",
      transform:  "translateX(-50%)",
      width:      "calc(100% - 32px)",
      maxWidth:   400,
      display:    "flex",
      justifyContent: "space-around",
      padding:    "8px 6px",
      background: "rgba(15, 23, 42, 0.8)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      border:     "1px solid rgba(255, 255, 255, 0.08)",
      boxShadow:  "0 16px 32px rgba(0,0,0,0.3)",
      zIndex:     100,
      borderRadius: "100px",
    }}>
      {items.map(it => {
        const active = !it.disabled && isActive(it.href, it.exact)
        const itemStyle: React.CSSProperties = {
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          gap:            2,
          background:     active ? "rgba(188,255,0,0.12)" : "transparent",
          borderRadius:   30,
          padding:        "6px 16px",
          cursor:         it.disabled ? "not-allowed" : "pointer",
          textDecoration: "none",
          minWidth:       56,
          opacity:        it.disabled ? 0.35 : 1,
          WebkitTapHighlightColor: "transparent",
        }
        const iconStyle: React.CSSProperties = {
          fontFamily:            "'Material Symbols Outlined'",
          fontVariationSettings: `'FILL' ${active ? 1 : 0}, 'wght' 400`,
          fontSize:              22,
          color:                 active ? "#bcff00" : "#94a3b8",
          lineHeight:            1,
        }
        const labelStyle: React.CSSProperties = {
          fontSize:      9,
          fontWeight:    900,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color:         active ? "#bcff00" : "#94a3b8",
          fontFamily:    "var(--font-space-grotesk), Space Grotesk, sans-serif",
        }

        if (it.disabled) {
          return (
            <div key={it.href} title={it.tooltip} style={itemStyle}>
              <span style={iconStyle}>{it.icon}</span>
              <span style={labelStyle}>{it.label}</span>
            </div>
          )
        }

        return (
          <Link key={it.href} href={it.href as AnyHref} style={itemStyle}>
            <span style={iconStyle}>{it.icon}</span>
            <span style={labelStyle}>{it.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
