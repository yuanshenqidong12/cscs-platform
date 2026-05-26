"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Activity, BookOpen, TrendingUp, Trash2, Edit3, Check, X } from "lucide-react"
import { SPORTS } from "@/lib/constants"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Assessment { id: string; date: string; type: string; results: string }
interface Program { id: string; name: string; goal: string; status: string; startDate: string; endDate: string }
interface Athlete {
  id: string; name: string; sport: string; discipline: string | null; weightClass: string | null
  level: string; status: string; trainingAge: number | null; height: number | null
  weight: number | null; bodyFat: number | null; sex: string | null
  goals: string | null; injuryHistory: string | null; notes: string | null
  assessments: Assessment[]; programs: Program[]
}

import { SPORT_LABELS } from "@/lib/constants"

const sportLabels = SPORT_LABELS

const TEST_TYPES = [
  { value: "STRENGTH_1RM", label: "1RM力量 (kg)", fields: ["深蹲", "卧推", "硬拉", "实力推举"] },
  { value: "POWER", label: "爆发力", fields: ["纵跳(cm)", "立定跳远(cm)", "药球侧抛(m)", "高翻(kg)"] },
  { value: "SPEED", label: "速度", fields: ["10m冲刺(s)", "30m冲刺(s)", "Pro敏捷(s)"] },
  { value: "BODY_COMPOSITION", label: "体成分", fields: ["体重(kg)", "体脂率(%)", "肌肉量(kg)"] },
  { value: "ENDURANCE", label: "耐力", fields: ["YOYO级别", "最大摄氧量"] },
  { value: "FMS", label: "FMS功能性筛查", fields: ["总分", "肩部", "髋部", "核心"] },
]

export default function AthleteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [athlete, setAthlete] = useState<Athlete | null>(null)
  const [loading, setLoading] = useState(true)
  const [testType, setTestType] = useState("STRENGTH_1RM")
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Record<string, string>>({})

  const loadAthlete = () => {
    fetch(`/api/athletes/${id}`)
      .then((r) => r.json())
      .then((data) => { setAthlete(data); setLoading(false) })
  }

  useEffect(() => { loadAthlete() }, [id])

  async function deleteAssessment(assessmentId: string) {
    if (!confirm("确定删除此测试记录？")) return
    await fetch(`/api/assessments/${assessmentId}`, { method: "DELETE" })
    loadAthlete()
  }

  function startEditing() {
    if (!athlete) return
    setEditData({
      name: athlete.name,
      sport: athlete.sport,
      discipline: athlete.discipline ?? "",
      level: athlete.level ?? "AMATEUR",
      trainingAge: athlete.trainingAge?.toString() ?? "",
      height: athlete.height?.toString() ?? "",
      weight: athlete.weight?.toString() ?? "",
      bodyFat: athlete.bodyFat?.toString() ?? "",
      goals: athlete.goals ?? "",
      injuryHistory: athlete.injuryHistory ?? "",
      notes: athlete.notes ?? "",
    })
    setEditing(true)
  }

  async function saveAthlete() {
    const data: Record<string, unknown> = {
      name: editData.name,
      sport: editData.sport,
      discipline: editData.discipline || null,
      level: editData.level,
      trainingAge: editData.trainingAge ? parseInt(editData.trainingAge) : null,
      height: editData.height ? parseFloat(editData.height) : null,
      weight: editData.weight ? parseFloat(editData.weight) : null,
      bodyFat: editData.bodyFat ? parseFloat(editData.bodyFat) : null,
      goals: editData.goals || null,
      injuryHistory: editData.injuryHistory || null,
      notes: editData.notes || null,
    }
    await fetch(`/api/athletes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    setEditing(false)
    loadAthlete()
  }

  async function saveAssessment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    const results: Record<string, number> = {}

    for (const [key, val] of formData.entries()) {
      if (key !== "testType" && val && typeof val === "string" && val.trim()) {
        results[key] = parseFloat(val as string)
      }
    }

    const selectedType = formData.get("testType") as string

    await fetch(`/api/athletes/${id}/assessments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: selectedType, results: JSON.stringify(results) }),
    })
    setSaving(false)
    form.reset()
    loadAthlete()
  }

  // Build chart data from assessments
  function getChartData() {
    if (!athlete?.assessments.length) return []
    const strengthTests = athlete.assessments.filter(a => a.type === "STRENGTH_1RM")
    if (strengthTests.length < 1) return []
    return strengthTests
      .map(a => {
        try {
          const r = JSON.parse(a.results)
          return {
            date: new Date(a.date).toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
            深蹲: r["深蹲"] || r["squat"] || null,
            卧推: r["卧推"] || r["bench"] || null,
            硬拉: r["硬拉"] || r["deadlift"] || null,
          }
        } catch { return null }
      })
      .filter(Boolean)
      .reverse()
  }

  const chartData = getChartData()
  const hasChartData = chartData.some(d => d && (d.深蹲 || d.卧推 || d.硬拉))

  if (loading) return <div className="text-center py-12 text-zinc-500">加载中...</div>
  if (!athlete) return <div className="text-center py-12 text-zinc-500">运动员不存在</div>

  return (
    <div className="max-w-4xl">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 mb-4">
        <ArrowLeft className="h-4 w-4" /> 返回
      </button>

      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">姓名</p>
                  <input className="w-full rounded border px-3 py-2 text-sm" value={editData.name ?? ""}
                    onChange={e => setEditData({ ...editData, name: e.target.value })} />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">运动项目</p>
                  <select className="w-full rounded border px-3 py-2 text-sm bg-white" value={editData.sport ?? ""}
                    onChange={e => setEditData({ ...editData, sport: e.target.value })}>
                    {SPORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">细分/位置</p>
                  <input className="w-full rounded border px-3 py-2 text-sm" value={editData.discipline ?? ""}
                    onChange={e => setEditData({ ...editData, discipline: e.target.value })} />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">竞技水平</p>
                  <select className="w-full rounded border px-3 py-2 text-sm bg-white" value={editData.level ?? ""}
                    onChange={e => setEditData({ ...editData, level: e.target.value })}>
                    <option value="AMATEUR">业余</option>
                    <option value="SEMI_PRO">半职业</option>
                    <option value="PROFESSIONAL">职业</option>
                    <option value="ELITE">精英/国家队</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="inline-flex items-center gap-1 rounded bg-indigo-600 text-white px-3 py-1.5 text-sm" onClick={saveAthlete}>
                  <Check className="h-3 w-3" /> 保存
                </button>
                <button className="inline-flex items-center gap-1 rounded border px-3 py-1.5 text-sm" onClick={() => setEditing(false)}>
                  <X className="h-3 w-3" /> 取消
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold">{athlete.name}</h1>
              <div className="flex gap-2 mt-1">
                <Badge>{sportLabels[athlete.sport] ?? athlete.sport}</Badge>
                {athlete.discipline && <Badge variant="outline">{athlete.discipline}</Badge>}
              </div>
            </div>
          )}
        </div>
        {!editing && (
          <Button variant="outline" size="sm" onClick={startEditing}>
            <Edit3 className="h-3 w-3 mr-1" /> 编辑
          </Button>
        )}
      </div>

      {/* Body stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {editing ? (
          <>
            {[
              { key: "height", label: "身高 (cm)" },
              { key: "weight", label: "体重 (kg)" },
              { key: "bodyFat", label: "体脂率 (%)" },
              { key: "trainingAge", label: "训练年限" },
            ].map((f) => (
              <div key={f.key} className="bg-white rounded-lg border p-3">
                <p className="text-xs text-zinc-500 mb-1">{f.label}</p>
                <input
                  className="w-full rounded border px-2 py-1.5 text-sm"
                  type="text" inputMode="decimal"
                  value={editData[f.key] ?? ""}
                  onChange={e => setEditData({ ...editData, [f.key]: e.target.value })}
                  placeholder="-"
                />
              </div>
            ))}
          </>
        ) : (
          <>
            {[
              { label: "身高", value: athlete.height ? `${athlete.height} cm` : "-" },
              { label: "体重", value: athlete.weight ? `${athlete.weight} kg` : "-" },
              { label: "体脂率", value: athlete.bodyFat ? `${athlete.bodyFat}%` : "-" },
              { label: "训练年限", value: athlete.trainingAge ? `${athlete.trainingAge} 年` : "-" },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-zinc-500">{s.label}</p>
                  <p className="font-bold text-lg">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Progress Chart */}
      {hasChartData && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> 1RM力量趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                {chartData.some(d => d?.深蹲) && <Line type="monotone" dataKey="深蹲" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />}
                {chartData.some(d => d?.卧推) && <Line type="monotone" dataKey="卧推" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />}
                {chartData.some(d => d?.硬拉) && <Line type="monotone" dataKey="硬拉" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Goals & Notes — editable */}
      {editing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs text-zinc-500 mb-1">训练目标</p>
            <input className="w-full rounded border px-3 py-2 text-sm" value={editData.goals ?? ""}
              onChange={e => setEditData({ ...editData, goals: e.target.value })} placeholder="例: 力量提升, 减脂, 备战比赛" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">伤病史</p>
            <input className="w-full rounded border px-3 py-2 text-sm" value={editData.injuryHistory ?? ""}
              onChange={e => setEditData({ ...editData, injuryHistory: e.target.value })} placeholder="既往伤病记录" />
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-zinc-500 mb-1">备注</p>
            <input className="w-full rounded border px-3 py-2 text-sm" value={editData.notes ?? ""}
              onChange={e => setEditData({ ...editData, notes: e.target.value })} />
          </div>
        </div>
      ) : (
        (athlete.goals || athlete.injuryHistory || athlete.notes) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {athlete.goals && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">训练目标</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-zinc-600">{athlete.goals}</p></CardContent>
              </Card>
            )}
            {athlete.injuryHistory && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-red-500">伤病史</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-zinc-600">{athlete.injuryHistory}</p></CardContent>
              </Card>
            )}
            {athlete.notes && (
              <Card className="md:col-span-2">
                <CardHeader className="pb-2"><CardTitle className="text-sm">备注</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-zinc-600">{athlete.notes}</p></CardContent>
              </Card>
            )}
          </div>
        )
      )}

      {/* Assessment Entry Form */}
      <div className="mb-6 p-4 border-2 border-dashed border-zinc-300 rounded-lg bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" /> 录入新测试
          </h3>
          <select
            className="rounded-lg border px-3 py-2 text-sm bg-white"
            onChange={(e) => setTestType(e.target.value)}
            defaultValue="STRENGTH_1RM"
          >
            {TEST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <form onSubmit={saveAssessment}>
          <input type="hidden" name="testType" value={testType} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {(TEST_TYPES.find(t => t.value === testType)?.fields ?? []).map((f) => (
              <div key={f}>
                <p className="text-xs text-zinc-500 mb-1">{f}</p>
                <input
                  name={f}
                  type="text"
                  inputMode="decimal"
                  className="w-full rounded border px-3 py-2 text-sm"
                  placeholder="输入数值"
                />
              </div>
            ))}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存测试数据"}
          </button>
        </form>
      </div>

      {/* Test Records History */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> 测试记录历史
          </CardTitle>
          <span className="text-sm text-zinc-400">{athlete.assessments.length} 条记录</span>
        </CardHeader>
        <CardContent>
          {athlete.assessments.length === 0 ? (
            <p className="text-sm text-zinc-400 py-4 text-center">暂无测试记录，在上方表单中录入第一条数据</p>
          ) : (
            <div className="space-y-3">
              {athlete.assessments.map((a) => {
                const typeLabel = TEST_TYPES.find(t => t.value === a.type)?.label ?? a.type
                let fields: Record<string, number> = {}
                try { fields = JSON.parse(a.results) } catch {}

                return (
                  <div key={a.id} className="border rounded-lg p-3 group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{typeLabel}</span>
                        <span className="text-xs text-zinc-400">{new Date(a.date).toLocaleDateString("zh-CN")}</span>
                      </div>
                      <button className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteAssessment(a.id)} title="删除">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(fields).map(([key, val]) => (
                        <div key={key} className="bg-zinc-50 rounded px-3 py-2 text-center">
                          <p className="text-xs text-zinc-500">{key}</p>
                          <p className="font-bold text-lg">{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Programs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" /> 训练计划
          </CardTitle>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => router.push(`/programs/new?athleteId=${athlete.id}`)}>
              <Plus className="h-3 w-3 mr-1" /> 新建
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {athlete.programs.length === 0 ? (
            <p className="text-sm text-zinc-400 py-4 text-center">暂无训练计划 — 点击"新建"为此运动员创建计划</p>
          ) : (
            <div className="space-y-2">
              {athlete.programs.map((p) => (
                <div key={p.id} className="text-sm border rounded p-2 cursor-pointer hover:bg-zinc-50"
                  onClick={() => router.push(`/programs/${p.id}/builder`)}>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-zinc-500">{p.startDate} ~ {p.endDate}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
