import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { buildProgramStructure, generateMesoStructure, buildWeekPrescriptions } from "@/lib/nsca/program-generator"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const { id } = await params
  const template = await prisma.programmeTemplate.findUnique({ where: { id } })
  if (!template) return NextResponse.json({ error: "未找到" }, { status: 404 })
  return NextResponse.json(template)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const { id } = await params
  const { athleteId } = await req.json()

  const template = await prisma.programmeTemplate.findUnique({ where: { id } })
  if (!template) return NextResponse.json({ error: "模板未找到" }, { status: 404 })

  const input = {
    userId, athleteId,
    sport: template.sport ?? "GENERAL_FITNESS",
    goal: template.goal,
    periodizationModel: template.periodizationModel,
    durationWeeks: template.durationWeeks,
    trainingFrequency: template.sessionsPerWeek,
    name: template.name,
  }

  const { programData, phases, split, freq } = buildProgramStructure(input)

  let athleteProfile = undefined
  if (athleteId) {
    const athlete = await prisma.athlete.findUnique({
      where: { id: athleteId },
      include: { assessments: { orderBy: { date: "desc" }, take: 20 } },
    })
    if (athlete) {
      let test1RM: Record<string, number> = {}
      const strengthTest = athlete.assessments.find(a => a.type === "STRENGTH_1RM")
      if (strengthTest) { try { Object.assign(test1RM, JSON.parse(strengthTest.results)) } catch {} }
      const powerTest = athlete.assessments.find(a => a.type === "POWER")
      if (powerTest) {
        try { const p = JSON.parse(powerTest.results); if (p["高翻(kg)"]) test1RM["高翻"] = p["高翻(kg)"] } catch {}
      }
      athleteProfile = { sport: athlete.sport, discipline: athlete.discipline, trainingAge: athlete.trainingAge, height: athlete.height, weight: athlete.weight, bodyFat: athlete.bodyFat, test1RM: Object.keys(test1RM).length > 0 ? test1RM : undefined }
    }
  }

  const exercises = await prisma.exercise.findMany({ take: 200 })

  const program = await prisma.program.create({
    data: { ...programData, coachId: userId, athleteId: athleteId || null },
  })

  let phaseStart = new Date(programData.startDate)
  for (let phaseIdx = 0; phaseIdx < phases.length; phaseIdx++) {
    const { mesoData, weeks, loading, mesoEnd } = generateMesoStructure(phases, program.id, phaseIdx, phaseStart)
    const mesocycle = await prisma.mesocycle.create({ data: mesoData })

    for (let w = 0; w < weeks; w++) {
      const weekStart = new Date(phaseStart.getTime() + w * 7 * 86400000)
      const { microData, sessions } = buildWeekPrescriptions(exercises, split, loading, freq, w, weeks, weekStart, phaseIdx, mesoData.phase, athleteProfile)
      const microcycle = await prisma.microcycle.create({ data: { ...microData, mesocycleId: mesocycle.id } })

      for (const s of sessions) {
        const ts = await prisma.session.create({ data: { ...s.sessionData, microcycleId: microcycle.id, coachId: userId } })
        for (const p of s.prescriptions) {
          await prisma.exercisePrescription.create({ data: { ...p, sessionId: ts.id } })
        }
      }
    }
    phaseStart = mesoEnd
  }

  const full = await prisma.program.findUnique({
    where: { id: program.id },
    include: { mesocycles: { include: { microcycles: { include: { sessions: { include: { prescriptions: true } } } } } } },
  })

  return NextResponse.json(full, { status: 201 })
}
