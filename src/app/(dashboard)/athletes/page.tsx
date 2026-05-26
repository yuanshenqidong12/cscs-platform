"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Users, Trash2 } from "lucide-react"
import { SPORT_LABELS } from "@/lib/constants"

interface Athlete {
  id: string
  name: string
  sport: string
  discipline: string | null
  level: string
  status: string
  weight: number | null
  height: number | null
  _count: { programs: number; assessments: number }
}

export default function AthletesPage() {
  const router = useRouter()
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/athletes")
      .then((r) => r.json())
      .then((data) => { setAthletes(data); setLoading(false) })
  }, [])

  const sportLabels = SPORT_LABELS

  const statusLabels: Record<string, { label: string; color: string }> = {
    ACTIVE: { label: "活跃", color: "bg-green-100 text-green-700" },
    INJURED: { label: "伤病", color: "bg-red-100 text-red-700" },
    OFF_SEASON: { label: "休赛", color: "bg-blue-100 text-blue-700" },
    RETIRED: { label: "退役", color: "bg-zinc-100 text-zinc-700" },
  }

  const filtered = athletes.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  )

  async function deleteAthlete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm("确定删除此运动员？相关测试记录和计划也将被删除。")) return
    await fetch(`/api/athletes/${id}`, { method: "DELETE" })
    setAthletes(athletes.filter((a) => a.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">运动员管理</h1>
        <Button onClick={() => router.push("/athletes/new")}>
          <Plus className="h-4 w-4 mr-1" /> 添加运动员
        </Button>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="搜索运动员..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-500">加载中...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto mb-3 text-zinc-300" />
          <p className="text-zinc-500">暂无运动员，点击上方按钮添加</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((a) => (
            <Card
              key={a.id}
              className="cursor-pointer hover:shadow-md transition-shadow relative"
              onClick={() => router.push(`/athletes/${a.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{a.name}</h3>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="secondary">
                        {sportLabels[a.sport] ?? a.sport}
                      </Badge>
                      {a.discipline && (
                        <Badge variant="outline">{a.discipline}</Badge>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${statusLabels[a.status]?.color ?? ""}`}>
                    {statusLabels[a.status]?.label ?? a.status}
                  </span>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-zinc-500">
                  <span>{a._count.programs} 个计划</span>
                  <span>{a._count.assessments} 次测试</span>
                  {a.weight && <span>{a.weight} kg</span>}
                  {a.height && <span>{a.height} cm</span>}
                </div>
                <button
                  className="absolute top-3 right-3 p-1 rounded text-zinc-400 hover:text-red-500 hover:bg-red-50"
                  onClick={(e) => deleteAthlete(a.id, e)}
                  title="删除运动员"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
