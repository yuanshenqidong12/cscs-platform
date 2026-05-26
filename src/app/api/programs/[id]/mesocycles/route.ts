import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const { id: programId } = await params
  const data = await req.json()

  const mesocycle = await prisma.mesocycle.create({
    data: { ...data, programId },
    include: {
      microcycles: {
        include: {
          sessions: {
            include: {
              prescriptions: {
                include: { exercise: { select: { id: true, name: true, nameEn: true, category: true, sessionRole: true } } },
              },
            },
          },
        },
      },
    },
  })

  return NextResponse.json(mesocycle, { status: 201 })
}
