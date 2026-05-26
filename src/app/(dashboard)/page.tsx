import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { SPORT_LABELS } from "@/lib/constants"
import {
  Users, BookOpen, Dumbbell, CalendarDays, TrendingUp,
  Plus, ArrowRight, Sparkles, Zap, Target, UserPlus, ClipboardList
} from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userId = (session.user as { id: string }).id
  const userName = session.user?.name || "教练"

  const [athleteCount, programCount, exerciseCount, sessionCount,
    recentAthletes, recentPrograms, templates, warmupCount, mainCount, accessoryCount
  ] = await Promise.all([
    prisma.athlete.count({ where: { coachId: userId } }),
    prisma.program.count({ where: { coachId: userId } }),
    prisma.exercise.count(),
    prisma.session.count({ where: { coachId: userId } }),
    prisma.athlete.findMany({ where: { coachId: userId }, orderBy: { updatedAt: "desc" }, take: 4 }),
    prisma.program.findMany({ where: { coachId: userId }, orderBy: { updatedAt: "desc" }, take: 4, include: { athlete: { select: { name: true } } } }),
    prisma.programmeTemplate.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.exercise.count({ where: { sessionRole: "WARMUP" } }),
    prisma.exercise.count({ where: { sessionRole: "MAIN" } }),
    prisma.exercise.count({ where: { sessionRole: "ACCESSORY" } }),
  ])

  const goalLabels: Record<string, string> = {
    HYPERTROPHY: "肌肥大", MAX_STRENGTH: "最大力量", POWER: "爆发力",
    SPORT_PERFORMANCE: "运动表现", PEAKING: "赛前峰值", GENERAL_FITNESS: "大众健身",
  }

  return (
    <div className="-m-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white px-8 py-10">
        <div className="max-w-5xl">
          <p className="text-indigo-200 text-sm mb-1">欢迎回来</p>
          <h1 className="text-3xl font-bold mb-2">{userName}，下午好</h1>
          <p className="text-indigo-200 max-w-lg">
            基于 NSCA 体能训练体系，为运动员设计科学、个性化的周期性训练计划
          </p>
          <div className="flex gap-3 mt-6">
            <Link
              href="/programs/new"
              className="inline-flex items-center gap-2 bg-white text-indigo-700 rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-indigo-50 transition-colors shadow-lg"
            >
              <Sparkles className="h-4 w-4" /> 创建训练计划
            </Link>
            <Link
              href="/athletes/new"
              className="inline-flex items-center gap-2 bg-white/20 text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-white/30 transition-colors"
            >
              <UserPlus className="h-4 w-4" /> 添加运动员
            </Link>
          </div>
        </div>
      </div>

      <div className="px-8 -mt-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "运动员", value: athleteCount, icon: Users, gradient: "from-blue-500 to-blue-600", bg: "bg-blue-50" },
            { label: "训练计划", value: programCount, icon: ClipboardList, gradient: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50" },
            { label: "训练课", value: sessionCount, icon: CalendarDays, gradient: "from-orange-500 to-orange-600", bg: "bg-orange-50" },
            { label: "动作库", value: exerciseCount, icon: Dumbbell, gradient: "from-violet-500 to-violet-600", bg: "bg-violet-50" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className={`h-1.5 bg-gradient-to-r ${s.gradient}`} />
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 font-medium">{s.label}</p>
                  <p className="text-2xl font-bold mt-0.5">{s.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${s.bg}`}>
                  <s.icon className="h-5 w-5 text-zinc-700" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h2 className="font-semibold text-sm text-zinc-900 mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" /> 快速操作
            </h2>
            <div className="space-y-2">
              {[
                { href: "/programs/new", icon: Sparkles, label: "需求分析向导", desc: "选择运动专项，自动生成周期化计划", color: "bg-indigo-50 text-indigo-600" },
                { href: "/athletes/new", icon: UserPlus, label: "添加运动员", desc: "创建运动员档案并录入测试数据", color: "bg-blue-50 text-blue-600" },
                { href: "/exercises", icon: Dumbbell, label: "浏览动作库", desc: `${exerciseCount} 个动作，热身·主体·辅助三区分类`, color: "bg-violet-50 text-violet-600" },
                { href: "/programs/templates", icon: BookOpen, label: "计划模板", desc: `${templates.length} 个预置运动专项模板`, color: "bg-emerald-50 text-emerald-600" },
              ].map((a) => (
                <Link key={a.href} href={a.href}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-50 transition-colors group">
                  <div className={`p-2 rounded-lg ${a.color} shrink-0`}>
                    <a.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium group-hover:text-indigo-600 transition-colors">{a.label}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{a.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-indigo-400 shrink-0 mt-1" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Athletes */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm text-zinc-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" /> 最近运动员
              </h2>
              <Link href="/athletes" className="text-xs text-indigo-600 hover:underline">查看全部</Link>
            </div>
            {recentAthletes.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-8 w-8 mx-auto text-zinc-300 mb-2" />
                <p className="text-sm text-zinc-400">暂无运动员</p>
                <Link href="/athletes/new" className="text-sm text-indigo-600 hover:underline mt-1 inline-block">添加第一位运动员</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentAthletes.map((a) => (
                  <Link key={a.id} href={`/athletes/${a.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-50 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {a.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{a.name}</p>
                      <p className="text-xs text-zinc-500">{SPORT_LABELS[a.sport] ?? a.sport}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Programs */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm text-zinc-900 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-emerald-500" /> 最近计划
              </h2>
              <Link href="/programs" className="text-xs text-indigo-600 hover:underline">查看全部</Link>
            </div>
            {recentPrograms.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="h-8 w-8 mx-auto text-zinc-300 mb-2" />
                <p className="text-sm text-zinc-400">暂无训练计划</p>
                <Link href="/programs/new" className="text-sm text-indigo-600 hover:underline mt-1 inline-block">创建第一个计划</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentPrograms.map((p) => (
                  <Link key={p.id} href={`/programs/${p.id}/builder`}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-50 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shrink-0">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-zinc-500">
                        {goalLabels[p.goal] ?? p.goal}
                        {p.athlete && ` · ${p.athlete.name}`}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Library Overview */}
        <div className="bg-white rounded-xl shadow-sm border p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm text-zinc-900 flex items-center gap-2">
              <Target className="h-4 w-4 text-violet-500" /> 动作库概览
            </h2>
            <Link href="/exercises" className="text-xs text-indigo-600 hover:underline">浏览全部 {exerciseCount} 个动作</Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "热身激活", count: warmupCount, color: "from-orange-400 to-orange-500", bg: "bg-orange-50", desc: "核心激活·灵活性·神经激活" },
              { label: "主体训练", count: mainCount, color: "from-indigo-500 to-indigo-600", bg: "bg-indigo-50", desc: "复合动作·爆发力·力量训练" },
              { label: "辅助训练", count: accessoryCount, color: "from-teal-400 to-teal-500", bg: "bg-teal-50", desc: "小肌群·核心·康复预防" },
            ].map((z) => (
              <div key={z.label} className="rounded-xl border p-4 text-center">
                <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${z.color} flex items-center justify-center text-white mb-2`}>
                  <Dumbbell className="h-5 w-5" />
                </div>
                <p className="font-bold text-lg">{z.count}</p>
                <p className="text-sm font-medium">{z.label}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{z.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Templates */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm text-zinc-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" /> 预置训练模板
            </h2>
            <Link href="/programs/templates" className="text-xs text-indigo-600 hover:underline">查看全部模板</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {templates.map((tpl) => (
              <Link key={tpl.id} href={`/programs/templates`}
                className="flex items-center gap-3 p-3 rounded-lg border hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {tpl.sport ? (SPORT_LABELS[tpl.sport] ?? tpl.sport).charAt(0) : "训"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-indigo-600 transition-colors">{tpl.name}</p>
                  <p className="text-xs text-zinc-500">{tpl.durationWeeks}周 · {tpl.sessionsPerWeek}次/周</p>
                </div>
                <ArrowRight className="h-3 w-3 text-zinc-300 group-hover:text-indigo-400" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
