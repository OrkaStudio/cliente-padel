import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Rutas de veedor: verificar cookie PIN ──────────────────────────────────
  // Excluir la página de login del veedor
  const veedorMatch = pathname.match(/^\/veedor\/([^/]+)(?!\/login)/)
  if (veedorMatch && !pathname.includes("/login")) {
    const club = veedorMatch[1]
    const pinOk = request.cookies.get(`veedor_pin_${club}`)?.value === "ok"
    if (!pinOk) {
      return NextResponse.redirect(new URL(`/veedor/${club}/login`, request.url))
    }
  }

  // ── Rutas de admin: verificar cookie PIN ──────────────────────────────────
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const pinOk = request.cookies.get("admin_pin")?.value === "ok"
    if (!pinOk) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  // ── Resto: refrescar sesión Supabase normalmente ───────────────────────────
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
