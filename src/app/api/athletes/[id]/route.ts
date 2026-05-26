import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const { id } = await params
  const athlete = await prisma.athlete.findUnique({
    where: { id },
    include: {
      assessments: { orderBy: { date: "desc" }, take: 10 },
      programs: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  })

  if (!athlete) return NextResponse.json({ error: "未找到" }, { status: 404 })
  return NextResponse.json(athlete)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const { id } = await params
  const data = await req.json()
  const athlete = await prisma.athlete.update({ where: { id }, data })
  return NextResponse.json(athlete)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const { id } = await params
  await prisma.athlete.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
