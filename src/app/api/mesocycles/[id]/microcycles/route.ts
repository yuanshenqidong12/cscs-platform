import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const { id: mesocycleId } = await params
  const data = await req.json()

  const microcycle = await prisma.microcycle.create({
    data: { ...data, mesocycleId },
    include: {
      sessions: {
        include: {
          prescriptions: {
            include: { exercise: { select: { id: true, name: true, nameEn: true, category: true, sessionRole: true } } },
          },
        },
      },
    },
  })

  return NextResponse.json(microcycle, { status: 201 })
}
