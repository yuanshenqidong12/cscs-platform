import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const { searchParams } = new URL(req.url)
  const sport = searchParams.get("sport")
  const status = searchParams.get("status")

  const where: Record<string, unknown> = { coachId: userId }
  if (sport) where.sport = sport
  if (status) where.status = status

  const athletes = await prisma.athlete.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { programs: true, assessments: true } } },
  })

  return NextResponse.json(athletes)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const data = await req.json()

  const athlete = await prisma.athlete.create({
    data: { ...data, coachId: userId },
  })

  return NextResponse.json(athlete, { status: 201 })
}
