import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const { id: microcycleId } = await params
  const userId = (session.user as { id: string }).id
  const data = await req.json()

  const trainingSession = await prisma.session.create({
    data: { ...data, microcycleId, coachId: userId },
    include: { prescriptions: true },
  })

  return NextResponse.json(trainingSession, { status: 201 })
}
