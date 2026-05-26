"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react"

interface Template {
  id: string
  name: string
  description: string | null
  sport: string | null
  goal: string
  periodizationModel: string
  durationWeeks: number
  sessionsPerWeek: number
}

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/templates")
      .then(r => r.json())
      .then(data => { setTemplates(data); setLoading(false) })
  }, [])

  async function applyTemplate(tpl: Template) {
    setApplying(tpl.id)
    const res = await fetch(`/api/templates/${tpl.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    if (res.ok) {
      const program = await res.json()
      router.push(`/programs/${program.id}/builder`)
    } else {
      alert("应用失败，请重试")
      setApplying(null)
    }
  }

  const sportLabels: Record<string, string> = {
    BOXING: "拳击", MMA: "综合格斗", WRESTLING: "摔跤", JUDO: "柔道",
    BJJ: "巴西柔术", BASKETBALL: "篮球", COMBAT: "格斗", FOOTBALL: "足球",
    VOLLEYBALL: "排球", SWIMMING: "游泳", WEIGHTLIFTING: "举重",
    POWERLIFTING: "力量举", GENERAL_FITNESS: "大众健身",
  }

  const goalLabels: Record<string, string> = {
    HYPERTROPHY: "肌肥大", MAX_STRENGTH: "最大力量", POWER: "爆发力",
    SPORT_PERFORMANCE: "运动表现", PEAKING: "赛前峰值", GENERAL_FITNESS: "大众健身",
  }

  const modelLabels: Record<string, string> = {
    LINEAR: "线性周期", BLOCK: "板块周期", UNDULATING_WEEKLY: "周波动",
    UNDULATING_DAILY: "日波动", CONJUGATE: "共轭周期",
  }

  return (
    <div>
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 mb-4">
        <ArrowLeft className="h-4 w-4" /> 返回
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">计划模板</h1>
          <p className="text-zinc-500 text-sm mt-1">选择一个预置模板快速创建训练计划，也可使用需求分析向导从零生成</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/programs/new")}>
          <Sparkles className="h-4 w-4 mr-1" /> 需求分析向导
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-500">加载中...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <Card key={tpl.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{tpl.name}</CardTitle>
                    <div className="flex gap-1 mt-2">
                      {tpl.sport && <Badge>{sportLabels[tpl.sport] ?? tpl.sport}</Badge>}
                      <Badge variant="secondary">{goalLabels[tpl.goal] ?? tpl.goal}</Badge>
                      <Badge variant="outline">{modelLabels[tpl.periodizationModel] ?? tpl.periodizationModel}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {tpl.description && (
                  <p className="text-sm text-zinc-600 mb-3">{tpl.description}</p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex gap-3 text-zinc-500">
                    <span>{tpl.durationWeeks} 周</span>
                    <span>{tpl.sessionsPerWeek} 次/周</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => applyTemplate(tpl)}
                    disabled={applying === tpl.id}
                  >
                    <BookOpen className="h-3 w-3 mr-1" />
                    {applying === tpl.id ? "应用..." : "使用模板"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && templates.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <BookOpen className="h-12 w-12 mx-auto mb-3 text-zinc-300" />
          <p>暂无可用模板</p>
        </div>
      )}
    </div>
  )
}
