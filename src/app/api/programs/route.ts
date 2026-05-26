import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const userId = (session.user as { id: string }).id

  const programs = await prisma.program.findMany({
    where: { coachId: userId },
    orderBy: { updatedAt: "desc" },
    include: {
      athlete: { select: { id: true, name: true } },
      _count: { select: { mesocycles: true } },
    },
  })

  return NextResponse.json(programs)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const data = await req.json()

  const program = await prisma.program.create({
    data: {
      ...data,
      coachId: userId,
      athleteId: data.athleteId || null,
    },
  })

  return NextResponse.json(program, { status: 201 })
}
