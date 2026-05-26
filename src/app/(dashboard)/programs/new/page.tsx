"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Check, Sparkles, Target, Dumbbell, Calendar, UserRound } from "lucide-react"
import { SPORT_NEEDS, getPhaseTemplate, type SportNeeds, type PhaseConfig } from "@/lib/nsca/needs-analysis"
import { SPORTS } from "@/lib/constants"

const GOALS = [
  { value: "MAX_STRENGTH", label: "最大力量", desc: "≥85% 1RM, 2-6组×1-6次" },
  { value: "POWER", label: "爆发力", desc: "75-90% 1RM, 3-5组×1-5次" },
  { value: "HYPERTROPHY", label: "肌肥大", desc: "67-85% 1RM, 3-6组×6-12次" },
  { value: "MUSCULAR_ENDURANCE", label: "肌耐力", desc: "≤67% 1RM, 2-3组×12+次" },
  { value: "SPORT_PERFORMANCE", label: "运动表现", desc: "综合发展，侧重专项转化" },
  { value: "PEAKING", label: "赛前峰值", desc: "85-95% 1RM, 低量高频" },
]

const MODELS = [
  { value: "BLOCK", label: "板块周期", desc: "不同阶段集中发展不同能力，适合格斗备战" },
  { value: "LINEAR", label: "线性周期", desc: "从量→强度逐步过渡，适合休赛期" },
  { value: "UNDULATING_WEEKLY", label: "周波动周期", desc: "每周变换训练刺激，适合赛季中" },
  { value: "UNDULATING_DAILY", label: "日波动周期", desc: "每日变换，适合高水平运动员" },
  { value: "CONJUGATE", label: "共轭周期", desc: "多能力并行发展，适合高级训练者" },
]

interface Athlete { id: string; name: string; sport: string }

export default function NewProgramWizard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1
  const [sport, setSport] = useState("")
  const [needs, setNeeds] = useState<SportNeeds | null>(null)

  // Step 2
  const [goal, setGoal] = useState("")
  const [model, setModel] = useState("BLOCK")

  // Step 3
  const [name, setName] = useState("")
  const [weeks, setWeeks] = useState(12)
  const [frequency, setFrequency] = useState(4)
  const [athleteId, setAthleteId] = useState(searchParams.get("athleteId") ?? "")
  const [athletes, setAthletes] = useState<Athlete[]>([])

  // Preview
  const [phases, setPhases] = useState<PhaseConfig[]>([])

  useEffect(() => {
    fetch("/api/athletes").then(r => r.json()).then(setAthletes)
  }, [])

  useEffect(() => {
    if (sport && weeks) {
      const n = SPORT_NEEDS[sport]
      setNeeds(n ?? null)
      setPhases(getPhaseTemplate(sport, weeks))
      if (n && !goal) setGoal(n.recommendedGoals[0] ?? "")
      if (!name) {
        const label = SPORTS.find(s => s.value === sport)?.label ?? sport
        setName(`${label} ${weeks}周训练计划`)
      }
    }
  }, [sport, weeks])

  async function onGenerate() {
    setLoading(true)
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sport, goal, periodizationModel: model,
        durationWeeks: weeks, trainingFrequency: frequency,
        athleteId: athleteId || null, name,
      }),
    })
    if (res.ok) {
      const program = await res.json()
      if (athleteId) {
        router.push(`/athletes/${athleteId}`)
      } else {
        router.push(`/programs/${program.id}/builder`)
      }
    } else {
      alert("生成失败，请重试")
      setLoading(false)
    }
  }

  function canNext() {
    if (step === 1) return !!sport
    if (step === 2) return !!goal
    return true
  }

  const phaseLabels: Record<string, string> = {
    GENERAL_PREPARATION: "一般准备期", SPECIFIC_PREPARATION: "专项准备期",
    HYPERTROPHY: "肌肥大", STRENGTH: "力量", POWER: "爆发力",
    PEAKING: "峰值/赛前", COMPETITION: "比赛期", TRANSITION: "过渡期",
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 mb-6">
        <ArrowLeft className="h-4 w-4" /> 返回
      </button>

      <h1 className="text-2xl font-bold mb-2">需求分析向导</h1>
      <p className="text-zinc-500 mb-6">基于运动专项和训练目标，自动生成NSCA周期化训练计划</p>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`flex-1 h-1 rounded ${s <= step ? "bg-indigo-500" : "bg-zinc-200"}`} />
        ))}
      </div>

      {/* Step 1: Sport */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> 第一步：选择运动项目</CardTitle>
            <CardDescription>选择主要运动专项，系统将自动分析体能需求</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {SPORTS.map((s) => (
                <button
                  key={s.value}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${sport === s.value ? "border-indigo-500 bg-indigo-50" : "border-zinc-200 hover:border-zinc-400"}`}
                  onClick={() => setSport(s.value)}
                >
                  <span className="text-lg">{s.icon}</span>
                  <p className="font-medium text-sm mt-1">{s.label}</p>
                </button>
              ))}
            </div>

            {needs && (
              <div className="mt-6 p-4 bg-zinc-50 rounded-lg space-y-3">
                <h4 className="font-semibold text-sm">体能需求分析</h4>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">主要能量系统</p>
                  <div className="flex gap-1">{needs.primaryEnergySystem.map(e => <Badge key={e} variant="outline" className="text-xs">{e}</Badge>)}</div>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">关键动作模式</p>
                  <div className="flex flex-wrap gap-1">{needs.priorityMovementPatterns.map(p => <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>)}</div>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">专项特殊需求</p>
                  <div className="flex flex-wrap gap-1">{needs.specialDemands.map(d => <Badge key={d} className="text-xs bg-orange-50 text-orange-600">{d}</Badge>)}</div>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">常见损伤</p>
                  <span className="text-xs text-red-500">{needs.commonInjuries.join("、")}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Goal & Model */}
      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Dumbbell className="h-5 w-5" /> 第二步：训练目标</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g.value}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${goal === g.value ? "border-indigo-500 bg-indigo-50" : "border-zinc-200 hover:border-zinc-400"}`}
                    onClick={() => setGoal(g.value)}
                  >
                    <p className="font-medium text-sm">{g.label}</p>
                    <p className="text-xs text-zinc-500 mt-1">{g.desc}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 周期化模型</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {MODELS.map((m) => (
                  <button
                    key={m.value}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${model === m.value ? "border-indigo-500 bg-indigo-50" : "border-zinc-200 hover:border-zinc-400"}`}
                    onClick={() => setModel(m.value)}
                  >
                    <p className="font-medium text-sm">{m.label}</p>
                    <p className="text-xs text-zinc-500 mt-1">{m.desc}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Settings */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5" /> 第三步：计划设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>计划名称</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>训练周期 (周)</Label>
                <Input type="number" min={4} max={52} value={weeks} onChange={(e) => setWeeks(parseInt(e.target.value) || 12)} />
              </div>
              <div>
                <Label>每周训练次数</Label>
                <Input type="number" min={1} max={7} value={frequency} onChange={(e) => setFrequency(parseInt(e.target.value) || 4)} />
              </div>
            </div>
            <div>
              <Label>关联运动员 (可选)</Label>
              <select className="w-full rounded border px-2 py-2 text-sm" value={athleteId} onChange={(e) => setAthleteId(e.target.value)}>
                <option value="">不关联</option>
                {athletes.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.sport})</option>)}
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Preview & Generate */}
      {step === 4 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-indigo-500" /> 生成预览</CardTitle>
              <CardDescription>系统将创建以下周期化结构</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex gap-2 text-sm">
                  <span className="text-zinc-500">运动：</span>
                  <span className="font-medium">{SPORTS.find(s => s.value === sport)?.label ?? sport}</span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="text-zinc-500">目标：</span>
                  <span className="font-medium">{GOALS.find(g => g.value === goal)?.label ?? goal}</span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="text-zinc-500">周期：</span>
                  <span className="font-medium">{weeks} 周 / 每周 {frequency} 次训练</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">训练阶段划分：</p>
                {phases.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-zinc-50 text-sm">
                    <div>
                      <span className="font-medium">{p.name}</span>
                      <span className="text-zinc-500 ml-2">({phaseLabels[p.phase] ?? p.phase})</span>
                    </div>
                    <div className="text-right text-xs text-zinc-500">
                      <span>{p.weeks}周</span>
                      <span className="ml-2">{p.setsReps}</span>
                      <span className="ml-2">{p.loadRange}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full h-12 text-lg"
            onClick={onGenerate}
            disabled={loading}
          >
            {loading ? (
              "正在生成完整训练计划..."
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" /> 自动生成训练计划
              </>
            )}
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
          <ArrowLeft className="h-4 w-4 mr-1" /> 上一步
        </Button>
        {step < 4 && (
          <Button onClick={() => setStep(step + 1)} disabled={!canNext()}>
            下一步 <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  )
}
