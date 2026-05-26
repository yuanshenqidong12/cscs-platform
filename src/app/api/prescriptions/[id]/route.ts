import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessionUser = await auth()
  if (!sessionUser?.user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const { id } = await params
  const data = await req.json()
  const prescription = await prisma.exercisePrescription.update({
    where: { id },
    data,
    include: { exercise: { select: { id: true, name: true, nameEn: true, category: true } } },
  })
  return NextResponse.json(prescription)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessionUser = await auth()
  if (!sessionUser?.user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const { id } = await params
  await prisma.exercisePrescription.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
