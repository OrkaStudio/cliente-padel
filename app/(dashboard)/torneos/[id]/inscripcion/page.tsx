import { redirect } from "next/navigation"

export default async function InscripcionRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/admin/torneo/${id}/inscripcion`)
}
