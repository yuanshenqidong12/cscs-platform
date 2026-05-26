import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const { id } = await params
  const assessments = await prisma.assessment.findMany({
    where: { athleteId: id },
    orderBy: { date: "desc" },
  })

  return NextResponse.json(assessments)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const { id: athleteId } = await params
  const userId = (session.user as { id: string }).id
  const { type, results, date, notes } = await req.json()

  const assessment = await prisma.assessment.create({
    data: {
      athleteId,
      coachId: userId,
      type,
      results: typeof results === "string" ? results : JSON.stringify(results),
      date: date ? new Date(date) : new Date(),
      notes: notes || null,
    },
  })

  return NextResponse.json(assessment, { status: 201 })
}
