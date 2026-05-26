"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Dumbbell, Flame, Zap, Target } from "lucide-react"

const CATEGORIES = [
  { value: "", label: "全部分类" },
  { value: "STRENGTH", label: "力量" },
  { value: "POWER", label: "爆发力" },
  { value: "CORE", label: "核心" },
  { value: "SPEED", label: "速度" },
  { value: "PLYOMETRIC", label: "快速伸缩" },
  { value: "FLEXIBILITY", label: "柔韧性" },
  { value: "RECOVERY", label: "恢复" },
  { value: "WARMUP", label: "热身激活" },
]

const SESSION_ROLES = [
  { value: "", label: "全部角色", icon: null },
  { value: "WARMUP", label: "热身激活", icon: Flame },
  { value: "MAIN", label: "主体训练", icon: Zap },
  { value: "ACCESSORY", label: "辅助训练", icon: Target },
]

const PATTERNS = [
  { value: "", label: "全部模式" },
  { value: "SQUAT", label: "蹲" },
  { value: "HINGE", label: "铰链" },
  { value: "PUSH_HORIZONTAL", label: "水平推" },
  { value: "PUSH_VERTICAL", label: "垂直推" },
  { value: "PULL_HORIZONTAL", label: "水平拉" },
  { value: "PULL_VERTICAL", label: "垂直拉" },
  { value: "ROTATION", label: "旋转/抗旋" },
  { value: "CARRY", label: "负重行走" },
  { value: "CORE_BRACE", label: "核心支撑" },
  { value: "PLYOMETRIC", label: "爆发力" },
  { value: "GAIT", label: "步态" },
  { value: "MOBILITY", label: "灵活性" },
  { value: "OTHER", label: "其他" },
]

const DIFFICULTIES = [
  { value: "", label: "全部难度" },
  { value: "BEGINNER", label: "初级" },
  { value: "INTERMEDIATE", label: "中级" },
  { value: "ADVANCED", label: "高级" },
]

interface Exercise {
  id: string
  name: string
  nameEn: string | null
  category: string
  movementPattern: string
  difficulty: string
  sessionRole: string
  coachingCues: string
}

export default function ExercisesPage() {
  const router = useRouter()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [sessionRole, setSessionRole] = useState("")
  const [pattern, setPattern] = useState("")
  const [difficulty, setDifficulty] = useState("")

  useEffect(() => {
    async function fetchExercises() {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (category) params.set("category", category)
      if (pattern) params.set("movementPattern", pattern)
      if (difficulty) params.set("difficulty", difficulty)
      params.set("limit", "200")

      const res = await fetch(`/api/exercises?${params}`)
      const data = await res.json()
      const exs = data.exercises
      // 前端按 sessionRole 筛选
      const filtered = sessionRole ? exs.filter((e: Exercise) => e.sessionRole === sessionRole) : exs
      setExercises(filtered)
      setTotal(filtered.length)
      setLoading(false)
    }
    fetchExercises()
  }, [search, category, pattern, difficulty, sessionRole])

  const catLabels: Record<string, string> = {
    STRENGTH: "力量", POWER: "爆发力", CORE: "核心", SPEED: "速度",
    AGILITY: "敏捷", PLYOMETRIC: "快速伸缩", HYPERTROPHY: "肌肥大",
    ENDURANCE: "耐力", FLEXIBILITY: "柔韧", WARMUP: "热身", RECOVERY: "恢复",
  }

  const diffLabels: Record<string, string> = {
    BEGINNER: "初级", INTERMEDIATE: "中级", ADVANCED: "高级", ELITE: "精英",
  }
  const diffColors: Record<string, string> = {
    BEGINNER: "bg-green-100 text-green-700",
    INTERMEDIATE: "bg-yellow-100 text-yellow-700",
    ADVANCED: "bg-orange-100 text-orange-700",
    ELITE: "bg-red-100 text-red-700",
  }

  const patternLabels: Record<string, string> = {
    SQUAT: "蹲", HINGE: "铰链", PUSH_HORIZONTAL: "水平推", PUSH_VERTICAL: "垂直推",
    PULL_HORIZONTAL: "水平拉", PULL_VERTICAL: "垂直拉", ROTATION: "旋转",
    CARRY: "负重行走", CORE_BRACE: "核心支撑", PLYOMETRIC: "爆发力",
    GAIT: "步态", MOBILITY: "灵活", OTHER: "其他",
  }

  const roleLabels: Record<string, { label: string; color: string }> = {
    WARMUP: { label: "热身", color: "bg-orange-50 text-orange-600 border-orange-200" },
    MAIN: { label: "主体", color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
    ACCESSORY: { label: "辅助", color: "bg-teal-50 text-teal-600 border-teal-200" },
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">动作库</h1>
        <p className="text-sm text-zinc-500">共 {total} 个动作</p>
      </div>

      {/* 训练角色快速切换 */}
      <div className="flex gap-2 mb-4">
        {SESSION_ROLES.map((r) => {
          const isActive = sessionRole === r.value
          const roleInfo = r.value ? roleLabels[r.value] : null
          return (
            <button
              key={r.value}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                isActive
                  ? roleInfo?.color + " shadow-sm"
                  : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
              onClick={() => setSessionRole(r.value)}
            >
              {r.icon && <r.icon className="h-4 w-4" />}
              {r.label}
            </button>
          )
        })}
      </div>

      {/* 筛选器 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input placeholder="搜索动作..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="rounded-lg border px-3 py-2 text-sm bg-white" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select className="rounded-lg border px-3 py-2 text-sm bg-white" value={pattern} onChange={(e) => setPattern(e.target.value)}>
          {PATTERNS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <select className="rounded-lg border px-3 py-2 text-sm bg-white" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
      </div>

      {/* 动作列表 */}
      {loading ? (
        <div className="text-center py-12 text-zinc-500">加载中...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {exercises.map((ex) => (
            <Card key={ex.id} className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/exercises/${ex.id}`)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{ex.name}</h3>
                      {roleLabels[ex.sessionRole] && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${roleLabels[ex.sessionRole].color}`}>
                          {roleLabels[ex.sessionRole].label}
                        </span>
                      )}
                    </div>
                    {ex.nameEn && <p className="text-xs text-zinc-400 mt-0.5">{ex.nameEn}</p>}
                  </div>
                  <Dumbbell className="h-4 w-4 text-zinc-300" />
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  <span className="text-xs bg-zinc-100 px-2 py-0.5 rounded">{catLabels[ex.category] ?? ex.category}</span>
                  <span className="text-xs bg-zinc-100 px-2 py-0.5 rounded">{patternLabels[ex.movementPattern] ?? ex.movementPattern}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${diffColors[ex.difficulty] ?? ""}`}>
                    {diffLabels[ex.difficulty] ?? ex.difficulty}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && exercises.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <Dumbbell className="h-12 w-12 mx-auto mb-3 text-zinc-300" />
          <p>没有找到匹配的动作</p>
        </div>
      )}
    </div>
  )
}
