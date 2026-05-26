"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Filter, X, Plus, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CalEvent {
  id: string
  title: string
  start: string
  backgroundColor: string
  borderColor: string
  textColor: string
  extendedProps: {
    programId: string
    programName: string
    sessionType: string
    mesocyclePhase: string
    weekNumber: number
    dayLabel: string
    exerciseCount: number
    athleteName?: string
  }
}

const sessionColors: Record<string, { bg: string; border: string }> = {
  STRENGTH: { bg: "#6366f1", border: "#4f46e5" },
  POWER: { bg: "#ef4444", border: "#dc2626" },
  SPEED: { bg: "#f59e0b", border: "#d97706" },
  AGILITY: { bg: "#10b981", border: "#059669" },
  CONDITIONING: { bg: "#8b5cf6", border: "#7c3aed" },
  HYPERTROPHY: { bg: "#ec4899", border: "#db2777" },
  RECOVERY: { bg: "#14b8a6", border: "#0d9488" },
  SPORT_PRACTICE: { bg: "#0ea5e9", border: "#0284c7" },
  COMPETITION: { bg: "#f97316", border: "#ea580c" },
  TESTING: { bg: "#64748b", border: "#475569" },
}

const sessionTypeLabels: Record<string, string> = {
  STRENGTH: "力量", POWER: "爆发力", SPEED: "速度", AGILITY: "敏捷",
  CONDITIONING: "体能", HYPERTROPHY: "肌肥大", RECOVERY: "恢复",
  SPORT_PRACTICE: "专项训练", COMPETITION: "比赛", TESTING: "测试", OTHER: "其他",
}

export default function CalendarPage() {
  const router = useRouter()
  const [events, setEvents] = useState<CalEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null)
  const [filter, setFilter] = useState<string>("all")
  const [showForm, setShowForm] = useState(false)
  const [newSession, setNewSession] = useState({ date: new Date().toISOString().split("T")[0], sessionType: "STRENGTH", name: "" })
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    loadSessions()
  }, [])

  async function loadSessions() {
    setLoading(true)
    const [programsRes] = await Promise.all([
      fetch("/api/programs"),
    ])
    const programs = await programsRes.json()

    const allEvents: CalEvent[] = []
    for (const prog of programs) {
      const detailRes = await fetch(`/api/programs/${prog.id}`)
      if (!detailRes.ok) continue
      const detail = await detailRes.json()

      for (const meso of (detail.mesocycles || [])) {
        for (const micro of (meso.microcycles || [])) {
          for (const session of (micro.sessions || [])) {
            const colors = sessionColors[session.sessionType] ?? sessionColors["TESTING"]
            allEvents.push({
              id: session.id,
              title: `${sessionTypeLabels[session.sessionType] ?? session.sessionType}${session.name ? ` · ${session.name}` : ""}`,
              start: session.date,
              backgroundColor: colors.bg,
              borderColor: colors.border,
              textColor: "#ffffff",
              extendedProps: {
                programId: prog.id,
                programName: prog.name,
                sessionType: session.sessionType,
                mesocyclePhase: meso.phase,
                weekNumber: micro.weekNumber,
                dayLabel: ["日", "一", "二", "三", "四", "五", "六"][session.dayOfWeek] || "",
                exerciseCount: (session.prescriptions || []).length,
                athleteName: prog.athlete?.name,
              },
            })
          }
        }
      }
    }

    setEvents(allEvents)
    setLoading(false)
  }

  const dayLabels = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
  const phaseLabels: Record<string, string> = {
    HYPERTROPHY: "肌肥大", STRENGTH: "力量", POWER: "爆发力", PEAKING: "峰值",
    GENERAL_PREPARATION: "一般准备期", SPECIFIC_PREPARATION: "专项准备期",
    COMPETITION: "比赛期", TRANSITION: "过渡期",
  }

  const filteredEvents = filter === "all"
    ? events
    : events.filter(e => e.extendedProps.sessionType === filter)

  async function addSession() {
    setAdding(true)
    await fetch("/api/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSession),
    })
    setAdding(false)
    setShowForm(false)
    setNewSession({ date: new Date().toISOString().split("T")[0], sessionType: "STRENGTH", name: "" })
    loadSessions()
  }

  const sessionTypes = [...new Set(events.map(e => e.extendedProps.sessionType))]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6" /> 训练日历
        </h1>
        <div className="flex items-center gap-2">
          {loading && <span className="text-sm text-zinc-400">加载中...</span>}
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" /> 添加训练课
          </Button>
        </div>
      </div>

      {/* Add Session Form */}
      {showForm && (
        <div className="bg-white rounded-xl border shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">添加自定义训练课</h3>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowForm(false)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">日期</Label>
              <input type="date" className="w-full rounded border px-3 py-2 text-sm mt-1"
                value={newSession.date}
                onChange={e => setNewSession({ ...newSession, date: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">训练类型</Label>
              <select className="w-full rounded border px-3 py-2 text-sm mt-1 bg-white"
                value={newSession.sessionType}
                onChange={e => setNewSession({ ...newSession, sessionType: e.target.value })}>
                {Object.entries(sessionTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">名称</Label>
              <Input className="mt-1" value={newSession.name}
                onChange={e => setNewSession({ ...newSession, name: e.target.value })}
                placeholder="例: 晨练, 加练" />
            </div>
            <div className="flex items-end">
              <Button size="sm" onClick={addSession} disabled={adding} className="w-full">
                <Check className="h-3 w-3 mr-1" /> {adding ? "添加中..." : "确认添加"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Legend / Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filter === "all" ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-600 hover:border-zinc-400"}`}
          onClick={() => setFilter("all")}
        >
          全部 ({events.length})
        </button>
        {sessionTypes.map((type) => {
          const colors = sessionColors[type] ?? sessionColors["TESTING"]
          const count = events.filter(e => e.extendedProps.sessionType === type).length
          return (
            <button
              key={type}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filter === type ? "ring-2 ring-offset-1" : "hover:border-zinc-400"}`}
              style={{
                borderColor: filter === type ? colors.border : undefined,
                backgroundColor: filter === type ? colors.bg : "#fff",
                color: filter === type ? "#fff" : undefined,
              }}
              onClick={() => setFilter(filter === type ? "all" : type)}
            >
              {sessionTypeLabels[type] ?? type} ({count})
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek",
              }}
              buttonText={{ today: "今天", month: "月", week: "周" }}
              allDayText="全天"
              height="auto"
              locale="zh-cn"
              events={filteredEvents}
              eventClick={(info) => {
                const e = info.event
                const props = e.extendedProps as CalEvent["extendedProps"]
                setSelectedEvent({
                  id: e.id,
                  title: e.title,
                  start: e.startStr,
                  backgroundColor: e.backgroundColor || "#6366f1",
                  borderColor: e.borderColor || "#4f46e5",
                  textColor: e.textColor || "#fff",
                  extendedProps: props,
                })
              }}
              dayMaxEvents={3}
              eventTimeFormat={{ hour: "2-digit", minute: "2-digit", meridiem: false }}
              firstDay={1}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Selected Event Detail */}
          {selectedEvent ? (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">训练详情</h3>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedEvent(null)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">日期</span>
                    <span className="font-medium">
                      {dayLabels[new Date(selectedEvent.start + "T00:00:00").getDay()]} {selectedEvent.start}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">训练类型</span>
                    <Badge style={{ backgroundColor: selectedEvent.backgroundColor, color: "#fff" }}>
                      {sessionTypeLabels[selectedEvent.extendedProps.sessionType] ?? selectedEvent.extendedProps.sessionType}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">所属计划</span>
                    <span className="font-medium truncate max-w-[140px]">{selectedEvent.extendedProps.programName}</span>
                  </div>
                  {selectedEvent.extendedProps.athleteName && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">运动员</span>
                      <span className="font-medium">{selectedEvent.extendedProps.athleteName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-zinc-500">训练阶段</span>
                    <span>{phaseLabels[selectedEvent.extendedProps.mesocyclePhase] ?? selectedEvent.extendedProps.mesocyclePhase}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">动作数</span>
                    <span>{selectedEvent.extendedProps.exerciseCount} 个</span>
                  </div>
                </div>
                <Button
                  className="w-full mt-3"
                  size="sm"
                  onClick={() => router.push(`/programs/${selectedEvent.extendedProps.programId}/builder`)}
                >
                  打开训练计划
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-4 text-center text-sm text-zinc-400">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-zinc-300" />
                点击日历中的训练课<br />查看详细信息
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-3">训练统计</h3>
              <div className="grid grid-cols-2 gap-2 text-center">
                {[
                  { label: "总训练课", value: events.length },
                  { label: "训练类型", value: sessionTypes.length },
                  { label: "本周训练", value: events.filter(e => {
                    const d = new Date(e.start)
                    const now = new Date()
                    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1)
                    const weekEnd = new Date(weekStart.getTime() + 7 * 86400000)
                    return d >= weekStart && d < weekEnd
                  }).length },
                  { label: "本月训练", value: events.filter(e => {
                    const d = new Date(e.start)
                    const now = new Date()
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
                  }).length },
                ].map((s) => (
                  <div key={s.label} className="bg-zinc-50 rounded-lg p-2">
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-zinc-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
