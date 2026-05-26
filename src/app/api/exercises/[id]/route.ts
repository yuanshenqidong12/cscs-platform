import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const { id } = await params
  const exercise = await prisma.exercise.findUnique({ where: { id } })
  if (!exercise) return NextResponse.json({ error: "未找到" }, { status: 404 })

  return NextResponse.json(exercise)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const { id } = await params
  const data = await req.json()

  const exercise = await prisma.exercise.update({
    where: { id },
    data: {
      ...data,
      coachingCues: data.coachingCues ? JSON.stringify(data.coachingCues) : undefined,
      commonErrors: data.commonErrors ? JSON.stringify(data.commonErrors) : undefined,
      primaryMuscles: data.primaryMuscles ? JSON.stringify(data.primaryMuscles) : undefined,
      secondaryMuscles: data.secondaryMuscles ? JSON.stringify(data.secondaryMuscles) : undefined,
      equipment: data.equipment ? JSON.stringify(data.equipment) : undefined,
      imageUrls: data.imageUrls ? JSON.stringify(data.imageUrls) : undefined,
      sports: data.sports ? JSON.stringify(data.sports) : undefined,
    },
  })

  return NextResponse.json(exercise)
}
