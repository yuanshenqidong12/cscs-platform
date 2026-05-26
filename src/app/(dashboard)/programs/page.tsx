"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, BookOpen, Calendar, Trash2, Sparkles, PenLine } from "lucide-react"

interface Program {
  id: string
  name: string
  sport: string | null
  goal: string
  status: string
  startDate: string
  endDate: string
  periodizationModel: string
  athlete: { id: string; name: string } | null
  _count: { mesocycles: number }
}

export default function ProgramsPage() {
  const router = useRouter()
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/programs")
      .then((r) => r.json())
      .then((data) => { setPrograms(data); setLoading(false) })
  }, [])

  const sportLabels: Record<string, string> = {
    BOXING: "拳击", MMA: "综合格斗", WRESTLING: "摔跤", JUDO: "柔道",
    BJJ: "巴西柔术", BASKETBALL: "篮球", COMBAT: "格斗", FOOTBALL: "足球",
    VOLLEYBALL: "排球", RUGBY: "橄榄球", TENNIS: "网球", SWIMMING: "游泳",
    SPRINT: "短跑", DISTANCE_RUN: "中长跑", WEIGHTLIFTING: "举重",
    POWERLIFTING: "力量举", CROSSFIT: "综合体能", BODYBUILDING: "健美",
    GENERAL_FITNESS: "大众健身", TRACK_FIELD: "田径",
  }

  const goalLabels: Record<string, string> = {
    HYPERTROPHY: "肌肥大", MAX_STRENGTH: "最大力量", POWER: "爆发力",
    SPEED: "速度", MUSCULAR_ENDURANCE: "肌耐力", BODY_COMPOSITION: "身体成分",
    INJURY_PREVENTION: "损伤预防", SPORT_PERFORMANCE: "运动表现",
    GENERAL_FITNESS: "大众健身", PEAKING: "赛前峰值",
  }

  const statusLabels: Record<string, { label: string; color: string }> = {
    DRAFT: { label: "草稿", color: "bg-zinc-100 text-zinc-700" },
    ACTIVE: { label: "进行中", color: "bg-green-100 text-green-700" },
    COMPLETED: { label: "已完成", color: "bg-blue-100 text-blue-700" },
    ARCHIVED: { label: "已归档", color: "bg-zinc-100 text-zinc-500" },
  }

  const modelLabels: Record<string, string> = {
    LINEAR: "线性周期", UNDULATING_DAILY: "日波动周期",
    UNDULATING_WEEKLY: "周波动周期", BLOCK: "板块周期", CONJUGATE: "共轭周期",
  }

  async function createBlankProgram() {
    const res = await fetch("/api/programs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "手动编排计划",
        goal: "SPORT_PERFORMANCE",
        periodizationModel: "LINEAR",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 84 * 86400000).toISOString().split("T")[0],
      }),
    })
    if (res.ok) {
      const program = await res.json()
      router.push(`/programs/${program.id}/builder`)
    }
  }

  async function deleteProgram(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm("确定删除此训练计划？此操作不可恢复。")) return
    await fetch(`/api/programs/${id}`, { method: "DELETE" })
    setPrograms(programs.filter((p) => p.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">训练计划</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/programs/templates")}>
            <BookOpen className="h-4 w-4 mr-1" /> 从模板创建
          </Button>
          <Button variant="outline" onClick={() => router.push("/programs/new")}>
            <Sparkles className="h-4 w-4 mr-1" /> 需求向导
          </Button>
          <Button onClick={createBlankProgram}>
            <PenLine className="h-4 w-4 mr-1" /> 手动编排
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-500">加载中...</div>
      ) : programs.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto mb-3 text-zinc-300" />
          <p className="text-zinc-500 mb-4">暂无训练计划</p>
          <Button onClick={createBlankProgram}><PenLine className="h-4 w-4 mr-1" /> 手动编排第一个计划</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {programs.map((p) => (
            <Card
              key={p.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/programs/${p.id}/builder`)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{p.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${statusLabels[p.status]?.color}`}>
                      {statusLabels[p.status]?.label}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    {p.sport && <Badge variant="secondary">{sportLabels[p.sport] ?? p.sport}</Badge>}
                    <Badge variant="outline">{goalLabels[p.goal] ?? p.goal}</Badge>
                    <Badge variant="outline">{modelLabels[p.periodizationModel] ?? p.periodizationModel}</Badge>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-zinc-500">
                    <span>{p.startDate} ~ {p.endDate}</span>
                    <span>{p._count.mesocycles} 个训练阶段</span>
                    {p.athlete && <span>运动员: {p.athlete.name}</span>}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-zinc-400 hover:text-red-500 shrink-0 ml-2"
                  onClick={(e) => deleteProgram(p.id, e)}
                  title="删除计划"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
