import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const { id } = await params
  const program = await prisma.program.findUnique({
    where: { id },
    include: {
      athlete: { select: { id: true, name: true, sport: true } },
      mesocycles: {
        orderBy: { order: "asc" },
        include: {
          microcycles: {
            orderBy: { weekNumber: "asc" },
            include: {
              sessions: {
                orderBy: [{ dayOfWeek: "asc" }, { order: "asc" }],
                include: {
                  prescriptions: {
                    orderBy: { order: "asc" },
                    include: {
                      exercise: { select: { id: true, name: true, nameEn: true, category: true, movementPattern: true, primaryMuscles: true, sessionRole: true } },
                      loadPrescriptions: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!program) return NextResponse.json({ error: "未找到" }, { status: 404 })
  return NextResponse.json(program)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const { id } = await params
  const data = await req.json()
  const program = await prisma.program.update({ where: { id }, data })
  return NextResponse.json(program)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const { id } = await params
  await prisma.program.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
