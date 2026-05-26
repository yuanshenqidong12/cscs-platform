"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Dumbbell, Target, AlertTriangle, Lightbulb } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface Exercise {
  id: string
  name: string
  nameEn: string | null
  description: string | null
  category: string
  movementPattern: string
  primaryMuscles: string
  secondaryMuscles: string
  equipment: string
  difficulty: string
  sessionRole: string
  coachingCues: string
  commonErrors: string
  bilateral: string
  isNscaStandard: boolean
}

export default function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/exercises/${id}`)
      if (res.ok) {
        setExercise(await res.json())
      }
      setLoading(false)
    }
    load()
  }, [id])

  function parseArray(str: string): string[] {
    try { return JSON.parse(str) } catch { return [] }
  }

  const muscleLabels: Record<string, string> = {
    QUADRICEPS: "股四头肌", HAMSTRINGS: "腘绳肌", GLUTES: "臀大肌", CALVES: "小腿",
    PECTORALIS: "胸大肌", ANTERIOR_DELTOID: "三角肌前束", MEDIAL_DELTOID: "三角肌中束",
    TRICEPS: "肱三头肌", LATISSIMUS_DORSI: "背阔肌", TRAPEZIUS: "斜方肌",
    RHOMBOIDS: "菱形肌", POSTERIOR_DELTOID: "三角肌后束", BICEPS: "肱二头肌",
    FOREARMS: "前臂", RECTUS_ABDOMINIS: "腹直肌", OBLIQUES: "腹斜肌",
    TRANSVERSE_ABDOMINIS: "腹横肌", ERECTOR_SPINAE: "竖脊肌",
    HIP_FLEXORS: "髋屈肌", HIP_ADDUCTORS: "内收肌", HIP_ABDUCTORS: "外展肌",
    NECK: "颈部", ROTATOR_CUFF: "肩袖", SERRATUS_ANTERIOR: "前锯肌",
  }

  const categoryLabels: Record<string, string> = {
    STRENGTH: "力量训练", POWER: "爆发力训练", CORE: "核心训练",
    SPEED: "速度训练", AGILITY: "敏捷性", PLYOMETRIC: "快速伸缩复合",
    HYPERTROPHY: "肌肥大", ENDURANCE: "耐力", FLEXIBILITY: "柔韧性",
    WARMUP: "热身", RECOVERY: "恢复/再生",
  }

  const patternLabels: Record<string, string> = {
    SQUAT: "蹲", HINGE: "铰链", PUSH_HORIZONTAL: "水平推", PUSH_VERTICAL: "垂直推",
    PULL_HORIZONTAL: "水平拉", PULL_VERTICAL: "垂直拉", ROTATION: "旋转/抗旋",
    CARRY: "负重行走", CORE_BRACE: "核心支撑", PLYOMETRIC: "爆发力",
    GAIT: "步态", MOBILITY: "灵活性", OTHER: "其他",
  }

  const difficultyLabels: Record<string, string> = {
    BEGINNER: "初级", INTERMEDIATE: "中级", ADVANCED: "高级", ELITE: "精英",
  }

  const bilateralLabels: Record<string, string> = {
    BILATERAL: "双侧", UNILATERAL: "单侧", ALTERNATING: "交替",
  }

  const roleLabels: Record<string, { label: string; color: string }> = {
    WARMUP: { label: "热身激活", color: "bg-orange-50 text-orange-600" },
    MAIN: { label: "主体训练", color: "bg-indigo-50 text-indigo-600" },
    ACCESSORY: { label: "辅助训练", color: "bg-teal-50 text-teal-600" },
  }

  if (loading) return <div className="text-center py-12 text-zinc-500">加载中...</div>
  if (!exercise) return <div className="text-center py-12 text-zinc-500">动作不存在</div>

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> 返回
      </button>

      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold">{exercise.name}</h1>
          {exercise.nameEn && <p className="text-zinc-500">{exercise.nameEn}</p>}
        </div>
        <div className="flex gap-1">
          {exercise.isNscaStandard && (
            <Badge variant="secondary">NSCA标准</Badge>
          )}
          {exercise.sessionRole && (
            <Badge className={roleLabels[exercise.sessionRole]?.color}>
              {roleLabels[exercise.sessionRole]?.label}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Badge>{categoryLabels[exercise.category] ?? exercise.category}</Badge>
        <Badge variant="outline">{patternLabels[exercise.movementPattern] ?? exercise.movementPattern}</Badge>
        <Badge variant="outline">{difficultyLabels[exercise.difficulty] ?? exercise.difficulty}</Badge>
        <Badge variant="outline">{bilateralLabels[exercise.bilateral] ?? exercise.bilateral}</Badge>
        {roleLabels[exercise.sessionRole] && (
          <Badge className={roleLabels[exercise.sessionRole].color}>{roleLabels[exercise.sessionRole].label}</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-red-500" /> 主要肌群
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {parseArray(exercise.primaryMuscles).map((m: string) => (
                <Badge key={m} variant="secondary">{muscleLabels[m] ?? m}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-500" /> 辅助肌群
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {parseArray(exercise.secondaryMuscles).length > 0
                ? parseArray(exercise.secondaryMuscles).map((m: string) => (
                    <Badge key={m} variant="secondary">{muscleLabels[m] ?? m}</Badge>
                  ))
                : <span className="text-sm text-zinc-400">无</span>
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" /> 教学要点
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {parseArray(exercise.coachingCues).map((cue: string, i: number) => (
                <li key={i} className="text-sm text-zinc-600 flex gap-2">
                  <span className="text-indigo-400 mt-1">•</span> {cue}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" /> 常见错误
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {parseArray(exercise.commonErrors).map((err: string, i: number) => (
                <li key={i} className="text-sm text-zinc-600 flex gap-2">
                  <span className="text-red-400 mt-1">•</span> {err}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {exercise.description && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">动作描述</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600">{exercise.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
