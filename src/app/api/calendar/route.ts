import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const { date, sessionType, name } = await req.json()

  // 找到或创建"自由训练"计划
  let program = await prisma.program.findFirst({
    where: { coachId: userId, name: "自由训练", status: "ACTIVE" },
  })

  if (!program) {
    const today = new Date()
    program = await prisma.program.create({
      data: {
        coachId: userId,
        name: "自由训练",
        goal: "GENERAL_FITNESS",
        periodizationModel: "UNDULATING_WEEKLY",
        startDate: new Date(today.getFullYear(), 0, 1).toISOString().split("T")[0],
        endDate: new Date(today.getFullYear(), 11, 31).toISOString().split("T")[0],
        status: "ACTIVE",
      },
    })
  }

  // 找到或创建该周所在的微周期
  const d = new Date(date)
  const dayOfWeek = d.getDay()
  const weekStart = new Date(d.getFullYear(), d.getMonth(), d.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  const weekEnd = new Date(weekStart.getTime() + 6 * 86400000)
  const ws = weekStart.toISOString().split("T")[0]
  const we = weekEnd.toISOString().split("T")[0]

  // 计算这是第几周（从年初开始）
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const weekNumber = Math.floor((d.getTime() - yearStart.getTime()) / (7 * 86400000)) + 1

  // 找或创中周期（按月）
  const monthName = `${d.getFullYear()}年${d.getMonth() + 1}月`
  let mesocycle = await prisma.mesocycle.findFirst({
    where: { programId: program.id, name: monthName },
  })

  if (!mesocycle) {
    mesocycle = await prisma.mesocycle.create({
      data: {
        programId: program.id,
        name: monthName,
        phase: "GENERAL_PREPARATION",
        order: d.getMonth() + 1,
        startDate: new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0],
        endDate: new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split("T")[0],
      },
    })
  }

  // 找或创微周期
  let microcycle = await prisma.microcycle.findFirst({
    where: { mesocycleId: mesocycle.id, weekNumber },
  })

  if (!microcycle) {
    microcycle = await prisma.microcycle.create({
      data: { mesocycleId: mesocycle.id, weekNumber, startDate: ws, endDate: we },
    })
  }

  // 创建训练课
  const trainingSession = await prisma.session.create({
    data: {
      microcycleId: microcycle.id,
      coachId: userId,
      dayOfWeek: d.getDay(),
      date,
      sessionType,
      name: name || "自定义训练",
      order: 0,
    },
  })

  return NextResponse.json(trainingSession, { status: 201 })
}
