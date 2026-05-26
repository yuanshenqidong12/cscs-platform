import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const templates = await prisma.programmeTemplate.findMany({
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(templates)
}
