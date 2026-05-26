import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessionUser = await auth()
  if (!sessionUser?.user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const { id: sessionId } = await params
  const data = await req.json()

  const prescription = await prisma.exercisePrescription.create({
    data: { ...data, sessionId },
    include: { exercise: { select: { id: true, name: true, nameEn: true, category: true, sessionRole: true } } },
  })

  return NextResponse.json(prescription, { status: 201 })
}
