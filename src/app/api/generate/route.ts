import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { buildProgramStructure, generateMesoStructure, buildWeekPrescriptions } from "@/lib/nsca/program-generator"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const body = await req.json()
  const { sport, goal, periodizationModel, durationWeeks, trainingFrequency, athleteId, name } = body

  if (!sport || !durationWeeks) {
    return NextResponse.json({ error: "请选择运动项目和训练周期" }, { status: 400 })
  }

  const input = { userId, sport, goal, periodizationModel, durationWeeks, trainingFrequency, athleteId, name }
  const { programData, phases, split, freq } = buildProgramStructure(input)

  // 获取运动员个性化数据 + 最新测试数据
  let athleteProfile = undefined
  if (athleteId) {
    const athlete = await prisma.athlete.findUnique({
      where: { id: athleteId },
      include: {
        assessments: { orderBy: { date: "desc" }, take: 20 },
      },
    })
    if (athlete) {
      let test1RM: Record<string, number> = {}
      // 合并1RM力量测试
      const strengthTest = athlete.assessments.find(a => a.type === "STRENGTH_1RM")
      if (strengthTest) {
        try { Object.assign(test1RM, JSON.parse(strengthTest.results)) } catch {}
      }
      // 合并爆发力测试(含高翻)
      const powerTest = athlete.assessments.find(a => a.type === "POWER")
      if (powerTest) {
        try {
          const p = JSON.parse(powerTest.results)
          if (p["高翻(kg)"]) test1RM["高翻"] = p["高翻(kg)"]
        } catch {}
      }
      athleteProfile = {
        sport: athlete.sport,
        discipline: athlete.discipline,
        trainingAge: athlete.trainingAge,
        height: athlete.height,
        weight: athlete.weight,
        bodyFat: athlete.bodyFat,
        test1RM: Object.keys(test1RM).length > 0 ? test1RM : undefined,
      }
    }
  }

  // 获取动作库
  const exercises = await prisma.exercise.findMany({ take: 200 })

  // 创建计划
  const program = await prisma.program.create({
    data: { ...programData, coachId: userId, athleteId: athleteId || null },
  })

  // 按阶段生成周期
  let phaseStart = new Date(programData.startDate)
  for (let phaseIdx = 0; phaseIdx < phases.length; phaseIdx++) {
    const { mesoData, weeks, loading, mesoEnd } = generateMesoStructure(phases, program.id, phaseIdx, phaseStart)

    const mesocycle = await prisma.mesocycle.create({ data: mesoData })

    for (let w = 0; w < weeks; w++) {
      const weekStart = new Date(phaseStart.getTime() + w * 7 * 86400000)
      const { microData, sessions } = buildWeekPrescriptions(
        exercises, split, loading, freq, w, weeks, weekStart, phaseIdx, mesoData.phase, athleteProfile
      )

      const microcycle = await prisma.microcycle.create({
        data: { ...microData, mesocycleId: mesocycle.id },
      })

      for (const s of sessions) {
        const trainingSession = await prisma.session.create({
          data: { ...s.sessionData, microcycleId: microcycle.id, coachId: userId },
        })

        for (const p of s.prescriptions) {
          await prisma.exercisePrescription.create({
            data: { ...p, sessionId: trainingSession.id },
          })
        }
      }
    }

    phaseStart = mesoEnd
  }

  // 返回完整计划
  const full = await prisma.program.findUnique({
    where: { id: program.id },
    include: {
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
                    include: { exercise: { select: { id: true, name: true, category: true, sessionRole: true } } },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  return NextResponse.json(full, { status: 201 })
}
