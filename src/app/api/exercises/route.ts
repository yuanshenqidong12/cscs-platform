import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const movementPattern = searchParams.get("movementPattern")
  const sport = searchParams.get("sport")
  const difficulty = searchParams.get("difficulty")
  const search = searchParams.get("search")
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "50")

  const where: Record<string, unknown> = {}
  if (category) where.category = category
  if (movementPattern) where.movementPattern = movementPattern
  if (difficulty) where.difficulty = difficulty
  if (sport) where.sports = { contains: sport }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { nameEn: { contains: search } },
      { description: { contains: search } },
    ]
  }

  const [exercises, total] = await Promise.all([
    prisma.exercise.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: "asc" },
    }),
    prisma.exercise.count({ where }),
  ])

  return NextResponse.json({ exercises, total, page, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const data = await req.json()

  const exercise = await prisma.exercise.create({
    data: {
      ...data,
      createdById: userId,
      coachingCues: JSON.stringify(data.coachingCues ?? []),
      commonErrors: JSON.stringify(data.commonErrors ?? []),
      primaryMuscles: JSON.stringify(data.primaryMuscles ?? []),
      secondaryMuscles: JSON.stringify(data.secondaryMuscles ?? []),
      equipment: JSON.stringify(data.equipment ?? []),
      imageUrls: JSON.stringify(data.imageUrls ?? []),
      sports: JSON.stringify(data.sports ?? []),
    },
  })

  return NextResponse.json(exercise, { status: 201 })
}
