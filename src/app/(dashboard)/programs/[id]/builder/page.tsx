"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Plus, Trash2, GripVertical, ChevronDown, ChevronRight, Save, Printer } from "lucide-react"

// ---- Types ----
interface Exercise {
  id: string; name: string; nameEn: string | null; category: string; movementPattern: string; sessionRole: string
}

interface Prescription {
  id: string; exerciseId: string; order: number; sets: number | null; reps: string | null
  loadType: string | null; loadValue: number | null; restSeconds: number | null
  tempo: string | null; rpe: number | null; rir: number | null; notes: string | null
  exercise: { id: string; name: string; nameEn: string | null; category: string; sessionRole: string }
}

interface Session {
  id: string; dayOfWeek: number; date: string; sessionType: string; name: string | null
  warmupNotes: string | null; cooldownNotes: string | null; order: number
  prescriptions: Prescription[]
}

interface Microcycle {
  id: string; weekNumber: number; startDate: string; endDate: string; theme: string | null
  sessions: Session[]
}

interface Mesocycle {
  id: string; name: string; phase: string; order: number; startDate: string; endDate: string; notes: string | null
  microcycles: Microcycle[]
}

interface Program {
  id: string; name: string; sport: string | null; goal: string; periodizationModel: string
  startDate: string; endDate: string; trainingFrequency: number | null; status: string
  athlete: { id: string; name: string; sport: string } | null
  mesocycles: Mesocycle[]
}

// ---- Labels ----
const phaseLabels: Record<string, string> = {
  HYPERTROPHY: "肌肥大", STRENGTH: "力量", POWER: "爆发力", PEAKING: "峰值/赛前",
  ACTIVE_RECOVERY: "主动恢复", GENERAL_PREPARATION: "一般准备期", SPECIFIC_PREPARATION: "专项准备期",
  COMPETITION: "比赛期", TRANSITION: "过渡期", OFF_SEASON: "休赛期", PRE_SEASON: "赛季前",
  IN_SEASON: "赛季中", POST_SEASON: "赛季后",
}

const sessionTypeLabels: Record<string, string> = {
  STRENGTH: "力量", POWER: "爆发力", SPEED: "速度", AGILITY: "敏捷",
  CONDITIONING: "体能", HYPERTROPHY: "肌肥大", RECOVERY: "恢复",
  SPORT_PRACTICE: "专项训练", COMPETITION: "比赛", TESTING: "测试", OTHER: "其他",
}

const dayLabels = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
const categoryLabels: Record<string, string> = {
  STRENGTH: "力量", POWER: "爆发力", CORE: "核心", SPEED: "速度",
  PLYOMETRIC: "快速伸缩", FLEXIBILITY: "柔韧", RECOVERY: "恢复",
  HYPERTROPHY: "肌肥大", ENDURANCE: "耐力", WARMUP: "热身", AGILITY: "敏捷",
}

export default function ProgramBuilderPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [program, setProgram] = useState<Program | null>(null)
  const [exerciseLib, setExerciseLib] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedMeso, setExpandedMeso] = useState<Set<string>>(new Set())
  const [expandedMicro, setExpandedMicro] = useState<Set<string>>(new Set())
  const [dragOverSession, setDragOverSession] = useState<string | null>(null)
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null)
  const [mesoForm, setMesoForm] = useState({ name: "", phase: "STRENGTH", startDate: "", endDate: "" })
  const [showMesoForm, setShowMesoForm] = useState(false)

  const loadProgram = useCallback(async () => {
    const [progRes, exRes] = await Promise.all([
      fetch(`/api/programs/${id}`),
      fetch("/api/exercises?limit=200"),
    ])
    if (progRes.ok) {
      const data = await progRes.json()
      setProgram(data)
      setExpandedMeso(new Set(data.mesocycles.map((m: Mesocycle) => m.id)))
    }
    if (exRes.ok) {
      const data = await exRes.json()
      setExerciseLib(data.exercises)
    }
    setLoading(false)
  }, [id])

  useEffect(() => { loadProgram() }, [loadProgram])

  // ---- Mesocycle actions ----
  async function addMesocycle() {
    const res = await fetch(`/api/programs/${id}/mesocycles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...mesoForm,
        order: (program?.mesocycles.length ?? 0) + 1,
      }),
    })
    if (res.ok) {
      loadProgram()
      setShowMesoForm(false)
      setMesoForm({ name: "", phase: "STRENGTH", startDate: "", endDate: "" })
    }
  }

  async function deleteMesocycle(mesoId: string) {
    if (!confirm("确定删除此训练阶段？")) return
    await fetch(`/api/mesocycles/${mesoId}`, { method: "DELETE" })
    loadProgram()
  }

  // ---- Microcycle actions ----
  async function addMicrocycle(mesoId: string) {
    const meso = program?.mesocycles.find((m) => m.id === mesoId)
    const weekNum = (meso?.microcycles.length ?? 0) + 1
    const start = meso?.startDate ?? ""
    await fetch(`/api/mesocycles/${mesoId}/microcycles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekNumber: weekNum, startDate: start, endDate: start, theme: `第${weekNum}周` }),
    })
    loadProgram()
  }

  // ---- Session actions ----
  async function addSession(microId: string) {
    const micro = program?.mesocycles.flatMap(m => m.microcycles).find(mc => mc.id === microId)
    const dayCount = (micro?.sessions.length ?? 0)
    await fetch(`/api/microcycles/${microId}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dayOfWeek: dayCount + 1,
        date: micro?.startDate ?? "",
        sessionType: "STRENGTH",
        name: `训练课 ${dayCount + 1}`,
        order: dayCount,
      }),
    })
    loadProgram()
  }

  async function deleteSession(sessionId: string) {
    await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" })
    loadProgram()
  }

  // ---- Prescription actions ----
  async function addExerciseToSession(sessionId: string, exerciseId: string) {
    const session = program?.mesocycles
      .flatMap(m => m.microcycles.flatMap(mc => mc.sessions))
      .find(s => s.id === sessionId)
    const order = (session?.prescriptions.length ?? 0) + 1

    await fetch(`/api/sessions/${sessionId}/prescriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseId, order, sets: 3, reps: "8-12", loadType: "RPE", loadValue: 7 }),
    })
    loadProgram()
  }

  async function updatePrescription() {
    if (!editingPrescription) return
    await fetch(`/api/prescriptions/${editingPrescription.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingPrescription),
    })
    setEditingPrescription(null)
    loadProgram()
  }

  async function deletePrescription(presId: string) {
    await fetch(`/api/prescriptions/${presId}`, { method: "DELETE" })
    loadProgram()
  }

  async function saveProgram() {
    setSaving(true)
    if (program) {
      await fetch(`/api/programs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: program.name }),
      })
    }
    setSaving(false)
  }

  async function deleteProgram() {
    if (!confirm("确定删除整个训练计划？此操作不可恢复。")) return
    await fetch(`/api/programs/${id}`, { method: "DELETE" })
    router.push("/programs")
  }

  function handleDragOver(e: React.DragEvent, sessionId: string) {
    e.preventDefault()
    setDragOverSession(sessionId)
  }

  function handleDrop(e: React.DragEvent, sessionId: string) {
    e.preventDefault()
    setDragOverSession(null)
    const exerciseId = e.dataTransfer.getData("exerciseId")
    if (exerciseId) addExerciseToSession(sessionId, exerciseId)
  }

  // ---- Session type badge color ----
  function sessionColor(type: string) {
    const map: Record<string, string> = {
      STRENGTH: "bg-blue-100 text-blue-700", POWER: "bg-red-100 text-red-700",
      SPEED: "bg-orange-100 text-orange-700", AGILITY: "bg-green-100 text-green-700",
      CONDITIONING: "bg-purple-100 text-purple-700", HYPERTROPHY: "bg-pink-100 text-pink-700",
      RECOVERY: "bg-teal-100 text-teal-700", SPORT_PRACTICE: "bg-indigo-100 text-indigo-700",
      COMPETITION: "bg-yellow-100 text-yellow-700", TESTING: "bg-zinc-100 text-zinc-700",
    }
    return map[type] ?? "bg-zinc-100 text-zinc-700"
  }

  if (loading) return <div className="text-center py-12 text-zinc-500">加载中...</div>
  if (!program) return <div className="text-center py-12 text-zinc-500">计划不存在</div>

  return (
    <div className="flex gap-0 h-[calc(100vh-5rem)] -m-6">
      {/* Left: Exercise Library */}
      <div className="w-64 border-r bg-white overflow-y-auto shrink-0 p-3">
        <h3 className="font-semibold mb-3 text-sm px-1">动作库</h3>

        {(["WARMUP", "MAIN", "ACCESSORY"] as const).map((role) => {
          const roleExercises = exerciseLib.filter(e => e.sessionRole === role)
          if (roleExercises.length === 0) return null
          const roleStyle = role === "WARMUP"
            ? "border-l-orange-400" : role === "MAIN"
            ? "border-l-indigo-500" : "border-l-teal-500"
          const roleLabel = role === "WARMUP" ? "热身激活" : role === "MAIN" ? "主体训练" : "辅助训练"
          const roleColor = role === "WARMUP" ? "bg-orange-50" : role === "MAIN" ? "bg-indigo-50" : "bg-teal-50"

          return (
            <div key={role} className="mb-3">
              <p className={`text-[10px] font-bold uppercase text-zinc-500 px-1 mb-1 border-l-2 ${roleStyle} pl-2`}>
                {roleLabel} ({roleExercises.length})
              </p>
              <div className="space-y-0.5">
                {roleExercises.map((ex) => (
                  <div
                    key={ex.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("exerciseId", ex.id)
                      e.dataTransfer.effectAllowed = "copy"
                    }}
                    className={`text-xs p-1.5 rounded border cursor-grab hover:shadow-sm active:cursor-grabbing transition-all ${roleColor} hover:border-zinc-400`}
                  >
                    <p className="font-medium truncate">{ex.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Center: Periodization Structure */}
      <div className="flex-1 overflow-y-auto bg-zinc-50 p-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900">
            <ArrowLeft className="h-4 w-4" /> 返回
          </button>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={deleteProgram}>
              <Trash2 className="h-4 w-4 mr-1" /> 删除计划
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-1" /> 导出打印
            </Button>
            <Button size="sm" onClick={saveProgram} disabled={saving}>
              <Save className="h-4 w-4 mr-1" /> {saving ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>

        {/* Program Header */}
        <div className="mb-6">
          <input
            className="text-2xl font-bold bg-transparent border-b-2 border-transparent hover:border-zinc-300 focus:border-indigo-500 focus:outline-none w-full"
            value={program.name}
            onChange={(e) => setProgram({ ...program, name: e.target.value })}
          />
          <div className="flex gap-2 mt-2">
            <Badge>{program.startDate} ~ {program.endDate}</Badge>
            {program.athlete && <Badge variant="secondary">{program.athlete.name}</Badge>}
          </div>
        </div>

        {/* Mesocycles */}
        <div className="space-y-4">
          {program.mesocycles.map((meso) => (
            <Card key={meso.id} className="border-l-4 border-l-indigo-500">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
                    const next = new Set(expandedMeso)
                    next.has(meso.id) ? next.delete(meso.id) : next.add(meso.id)
                    setExpandedMeso(next)
                  }}>
                    {expandedMeso.has(meso.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <CardTitle className="text-base">
                      <input
                        className="bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-indigo-500 focus:outline-none"
                        value={meso.name}
                        onChange={(e) => {
                          const updated = program.mesocycles.map(m => m.id === meso.id ? { ...m, name: e.target.value } : m)
                          setProgram({ ...program, mesocycles: updated })
                        }}
                        onBlur={() => {
                          fetch(`/api/mesocycles/${meso.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ name: meso.name }),
                          })
                        }}
                      />
                    </CardTitle>
                    <Badge variant="secondary">{phaseLabels[meso.phase] ?? meso.phase}</Badge>
                    <span className="text-xs text-zinc-400">{meso.startDate} ~ {meso.endDate}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => addMicrocycle(meso.id)}>
                      <Plus className="h-3 w-3" /> 周
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteMesocycle(meso.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedMeso.has(meso.id) && (
                <CardContent>
                  {meso.microcycles.length === 0 ? (
                    <p className="text-sm text-zinc-400 py-4 text-center">暂无训练周，点击"+ 周"添加</p>
                  ) : (
                    <div className="space-y-3">
                      {meso.microcycles.map((micro) => (
                        <div key={micro.id} className="border rounded-lg">
                          <div className="flex items-center justify-between p-2 bg-zinc-50 cursor-pointer" onClick={() => {
                            const next = new Set(expandedMicro)
                            next.has(micro.id) ? next.delete(micro.id) : next.add(micro.id)
                            setExpandedMicro(next)
                          }}>
                            <div className="flex items-center gap-2">
                              {expandedMicro.has(micro.id) ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                              <span className="text-sm font-medium">第{micro.weekNumber}周</span>
                              {micro.theme && <span className="text-xs text-zinc-400">- {micro.theme}</span>}
                            </div>
                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); addSession(micro.id) }}>
                              <Plus className="h-3 w-3" /> 训练课
                            </Button>
                          </div>

                          {expandedMicro.has(micro.id) && (
                            <div className="p-2 space-y-2">
                              {micro.sessions.length === 0 ? (
                                <p className="text-xs text-zinc-400 text-center py-2">暂无训练课</p>
                              ) : (
                                micro.sessions.sort((a, b) => a.dayOfWeek - b.dayOfWeek).map((s) => (
                                  <div
                                    key={s.id}
                                    className={`border-2 rounded-lg p-3 transition-colors ${dragOverSession === s.id ? "border-indigo-400 bg-indigo-50" : "border-dashed border-zinc-300"}`}
                                    onDragOver={(e) => handleDragOver(e, s.id)}
                                    onDragLeave={() => setDragOverSession(null)}
                                    onDrop={(e) => handleDrop(e, s.id)}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <GripVertical className="h-3 w-3 text-zinc-400" />
                                        <span className="text-xs font-medium">{dayLabels[s.dayOfWeek]}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${sessionColor(s.sessionType)}`}>
                                          {sessionTypeLabels[s.sessionType] ?? s.sessionType}
                                        </span>
                                        {s.name && <span className="text-xs text-zinc-500">{s.name}</span>}
                                      </div>
                                      <Button size="sm" variant="ghost" className="text-red-500 h-6 w-6 p-0" onClick={() => deleteSession(s.id)}>
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>

                                    {s.prescriptions.length === 0 ? (
                                      <p className="text-[10px] text-zinc-400 text-center py-2">拖拽动作到这里</p>
                                    ) : (
                                      <div className="space-y-1">
                                        {s.prescriptions.sort((a, b) => a.order - b.order).map((p) => {
                                          const role = p.exercise.sessionRole || "MAIN"
                                          const zone = role === "WARMUP" ? "热身" : role === "ACCESSORY" ? "辅助" : "主体"
                                          const zoneStyle = zone === "热身" ? "bg-orange-50 text-orange-600" : zone === "主体" ? "bg-indigo-50 text-indigo-600" : "bg-teal-50 text-teal-600"
                                          return (
                                            <div
                                              key={p.id}
                                              className="flex items-center gap-3 text-xs p-2 rounded bg-white border cursor-pointer hover:bg-indigo-50"
                                              onClick={() => setEditingPrescription(p)}
                                            >
                                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${zoneStyle}`}>
                                                {zone}
                                              </span>
                                              <span className="font-medium flex-1 truncate">{p.exercise.name}</span>
                                              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded shrink-0">
                                                {p.sets ?? "-"} 组 × {p.reps ?? "-"} 次
                                              </span>
                                              {p.loadType === "ABSOLUTE_LOAD" && p.loadValue && (
                                                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded shrink-0">
                                                  {p.loadValue} kg
                                                </span>
                                              )}
                                              {p.restSeconds && (
                                                <span className="text-zinc-400 shrink-0">间歇{p.restSeconds}s</span>
                                              )}
                                              <Button size="sm" variant="ghost" className="text-red-400 h-5 w-5 p-0 shrink-0"
                                                onClick={(e) => { e.stopPropagation(); deletePrescription(p.id) }}>
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Add Mesocycle */}
        {showMesoForm ? (
          <Card className="mt-4 border-dashed border-2">
            <CardContent className="p-4 space-y-3">
              <Input placeholder="阶段名称" value={mesoForm.name} onChange={(e) => setMesoForm({ ...mesoForm, name: e.target.value })} />
              <div className="flex gap-2">
                <select className="rounded border px-2 py-1 text-sm" value={mesoForm.phase} onChange={(e) => setMesoForm({ ...mesoForm, phase: e.target.value })}>
                  {Object.entries(phaseLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <Input type="date" value={mesoForm.startDate} onChange={(e) => setMesoForm({ ...mesoForm, startDate: e.target.value })} />
                <Input type="date" value={mesoForm.endDate} onChange={(e) => setMesoForm({ ...mesoForm, endDate: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={addMesocycle}>确认添加</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowMesoForm(false)}>取消</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button variant="outline" className="mt-4 w-full border-dashed border-2" onClick={() => setShowMesoForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> 添加训练阶段
          </Button>
        )}
      </div>

      {/* Right: Prescription Editor */}
      {editingPrescription && (
        <div className="w-80 border-l bg-white overflow-y-auto shrink-0 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">{editingPrescription.exercise.name}</h3>
            <Button size="sm" variant="ghost" onClick={() => setEditingPrescription(null)}>✕</Button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium">组数</label>
              <Input type="number" value={editingPrescription.sets ?? ""}
                onChange={(e) => setEditingPrescription({ ...editingPrescription, sets: parseInt(e.target.value) || null })} />
            </div>
            <div>
              <label className="text-xs font-medium">次数</label>
              <Input value={editingPrescription.reps ?? ""} placeholder="例: 8-12, AMRAP"
                onChange={(e) => setEditingPrescription({ ...editingPrescription, reps: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium">间歇 (秒)</label>
              <Input type="number" value={editingPrescription.restSeconds ?? ""}
                onChange={(e) => setEditingPrescription({ ...editingPrescription, restSeconds: parseInt(e.target.value) || null })} />
            </div>
            <div>
              <label className="text-xs font-medium">备注</label>
              <Input value={editingPrescription.notes ?? ""}
                onChange={(e) => setEditingPrescription({ ...editingPrescription, notes: e.target.value || null })} />
            </div>
            <Button className="w-full" size="sm" onClick={updatePrescription}>保存处方</Button>
          </div>
        </div>
      )}
    </div>
  )
}
