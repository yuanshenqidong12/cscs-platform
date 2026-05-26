"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { SPORTS } from "@/lib/constants"

export default function NewAthletePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)

    const data = {
      name: form.get("name"),
      sport: form.get("sport"),
      discipline: form.get("discipline") || null,
      weightClass: form.get("weightClass") || null,
      level: form.get("level") || "AMATEUR",
      trainingAge: form.get("trainingAge") ? parseInt(form.get("trainingAge") as string) : null,
      height: form.get("height") ? parseFloat(form.get("height") as string) : null,
      weight: form.get("weight") ? parseFloat(form.get("weight") as string) : null,
      bodyFat: form.get("bodyFat") ? parseFloat(form.get("bodyFat") as string) : null,
      sex: form.get("sex") || null,
      notes: form.get("notes") || null,
      goals: form.get("goals") || null,
      injuryHistory: form.get("injuryHistory") || null,
    }

    const res = await fetch("/api/athletes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) { setError("创建失败"); setLoading(false); return }
    const athlete = await res.json()
    router.push(`/athletes/${athlete.id}`)
  }

  return (
    <div className="max-w-2xl">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 mb-4">
        <ArrowLeft className="h-4 w-4" /> 返回
      </button>
      <h1 className="text-2xl font-bold mb-6">添加运动员</h1>
      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">基本信息</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">姓名 *</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sex">性别</Label>
                <select id="sex" name="sex" className="w-full rounded-lg border px-3 py-2 text-sm bg-white">
                  <option value="">未指定</option>
                  <option value="MALE">男</option>
                  <option value="FEMALE">女</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sport">运动项目 *</Label>
                <select id="sport" name="sport" required className="w-full rounded-lg border px-3 py-2 text-sm bg-white">
                  <option value="">选择项目</option>
                  {SPORTS.map((s) => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discipline">位置/级别细分</Label>
                <Input id="discipline" name="discipline" placeholder="例: 后卫, 羽量级, 自由泳" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">竞技水平</Label>
                <select id="level" name="level" className="w-full rounded-lg border px-3 py-2 text-sm bg-white">
                  <option value="AMATEUR">业余</option>
                  <option value="SEMI_PRO">半职业</option>
                  <option value="PROFESSIONAL">职业</option>
                  <option value="ELITE">精英/国家队</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="trainingAge">训练年限</Label>
                <Input id="trainingAge" name="trainingAge" type="number" min="0" placeholder="年" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weightClass">体重级别 (如有)</Label>
              <Input id="weightClass" name="weightClass" placeholder="例: 66kg, 中量级" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">身体数据</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div className="space-y-2"><Label htmlFor="height">身高 (cm)</Label><Input id="height" name="height" type="number" step="0.1" /></div>
            <div className="space-y-2"><Label htmlFor="weight">体重 (kg)</Label><Input id="weight" name="weight" type="number" step="0.1" /></div>
            <div className="space-y-2"><Label htmlFor="bodyFat">体脂率 (%)</Label><Input id="bodyFat" name="bodyFat" type="number" step="0.1" /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">其他信息</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label htmlFor="goals">训练目标</Label><Input id="goals" name="goals" placeholder="力量提升, 减脂, 备战比赛..." /></div>
            <div className="space-y-2"><Label htmlFor="injuryHistory">伤病史</Label><Input id="injuryHistory" name="injuryHistory" placeholder="既往伤病记录" /></div>
            <div className="space-y-2"><Label htmlFor="notes">备注</Label><Input id="notes" name="notes" /></div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">{loading ? "创建中..." : "创建运动员"}</Button>
      </form>
    </div>
  )
}
