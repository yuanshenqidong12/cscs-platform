// 周期化训练计划生成引擎
// 微周期(周)→中周期(月, 3:1负荷)→大周期(完整计划)

import { getPhaseTemplate, SPORT_NEEDS } from "./needs-analysis"
import { LOADING_PARAMS } from "./loading-params"

// ---- 训练课结构 ----
interface SessionPlan {
  dayOfWeek: number
  name: string
  sessionType: string
  focus: "LOWER_STRENGTH" | "UPPER_PUSH" | "LOWER_POWER" | "UPPER_PULL" | "FULL_BODY" | "CONDITIONING" | "RECOVERY"
  warmupPatterns: string[]       // 热身动作模式偏好
  mainSlots: { pattern: string[]; label: string }[]  // 主体训练槽位 (每个槽位指定动作模式)
  accessoryPatterns: string[]    // 辅助动作模式偏好
}

// 4天/周 经典上下肢分化
const SPLIT_4DAY: SessionPlan[] = [
  {
    dayOfWeek: 1, name: "下肢力量", sessionType: "STRENGTH", focus: "LOWER_STRENGTH",
    warmupPatterns: ["CORE_BRACE", "MOBILITY", "SQUAT"],
    mainSlots: [
      { pattern: ["SQUAT"], label: "深蹲主项" },
      { pattern: ["HINGE"], label: "铰链主项" },
      { pattern: ["SQUAT"], label: "单侧下肢" },
    ],
    accessoryPatterns: ["HINGE", "CORE_BRACE"],
  },
  {
    dayOfWeek: 2, name: "上肢推力", sessionType: "STRENGTH", focus: "UPPER_PUSH",
    warmupPatterns: ["CORE_BRACE", "PUSH_HORIZONTAL", "ROTATOR_CUFF"],
    mainSlots: [
      { pattern: ["PUSH_HORIZONTAL"], label: "水平推主项" },
      { pattern: ["PUSH_VERTICAL"], label: "垂直推主项" },
      { pattern: ["PUSH_HORIZONTAL", "PUSH_VERTICAL"], label: "推类辅助" },
    ],
    accessoryPatterns: ["PULL_HORIZONTAL", "OTHER"],
  },
  {
    dayOfWeek: 4, name: "下肢爆发力", sessionType: "POWER", focus: "LOWER_POWER",
    warmupPatterns: ["CORE_BRACE", "PLYOMETRIC", "HINGE"],
    mainSlots: [
      { pattern: ["PLYOMETRIC"], label: "爆发力/奥举" },
      { pattern: ["SQUAT"], label: "深蹲变式" },
      { pattern: ["HINGE"], label: "铰链变式" },
    ],
    accessoryPatterns: ["SQUAT", "CORE_BRACE"],
  },
  {
    dayOfWeek: 5, name: "上肢拉力", sessionType: "STRENGTH", focus: "UPPER_PULL",
    warmupPatterns: ["CORE_BRACE", "PULL_VERTICAL", "ROTATOR_CUFF"],
    mainSlots: [
      { pattern: ["PULL_VERTICAL"], label: "垂直拉主项" },
      { pattern: ["PULL_HORIZONTAL"], label: "水平拉主项" },
      { pattern: ["PULL_VERTICAL", "PULL_HORIZONTAL", "CARRY"], label: "拉类辅助" },
    ],
    accessoryPatterns: ["CORE_BRACE", "FOREARMS"],
  },
]

// 3天/周 全身分化
const SPLIT_3DAY: SessionPlan[] = [
  {
    dayOfWeek: 1, name: "全身力量A", sessionType: "STRENGTH", focus: "FULL_BODY",
    warmupPatterns: ["CORE_BRACE", "MOBILITY", "SQUAT"],
    mainSlots: [
      { pattern: ["SQUAT"], label: "下肢主项" },
      { pattern: ["PUSH_HORIZONTAL", "PUSH_VERTICAL"], label: "上肢推主项" },
      { pattern: ["HINGE"], label: "铰链主项" },
    ],
    accessoryPatterns: ["PULL_HORIZONTAL", "CORE_BRACE"],
  },
  {
    dayOfWeek: 3, name: "全身爆发力", sessionType: "POWER", focus: "FULL_BODY",
    warmupPatterns: ["CORE_BRACE", "PLYOMETRIC", "MOBILITY"],
    mainSlots: [
      { pattern: ["PLYOMETRIC"], label: "爆发力主项" },
      { pattern: ["PUSH_VERTICAL"], label: "上肢爆发力" },
      { pattern: ["HINGE", "SQUAT"], label: "下肢爆发力" },
    ],
    accessoryPatterns: ["ROTATION", "CORE_BRACE"],
  },
  {
    dayOfWeek: 5, name: "全身力量B", sessionType: "STRENGTH", focus: "FULL_BODY",
    warmupPatterns: ["CORE_BRACE", "MOBILITY", "HINGE"],
    mainSlots: [
      { pattern: ["HINGE"], label: "下肢主项" },
      { pattern: ["PULL_VERTICAL", "PULL_HORIZONTAL"], label: "上肢拉主项" },
      { pattern: ["SQUAT"], label: "蹲类辅助" },
    ],
    accessoryPatterns: ["CARRY", "CORE_BRACE"],
  },
]

// 根据训练频率选择分化方案
function getSplit(frequency: number): SessionPlan[] {
  if (frequency >= 5) return [
    ...SPLIT_4DAY,
    { dayOfWeek: 6, name: "代谢体能", sessionType: "CONDITIONING", focus: "CONDITIONING",
      warmupPatterns: ["PLYOMETRIC", "MOBILITY"], mainSlots: [
        { pattern: ["GAIT", "PLYOMETRIC"], label: "速度/灵敏" },
        { pattern: ["PUSH_HORIZONTAL", "PULL_HORIZONTAL"], label: "上肢代谢" },
        { pattern: ["SQUAT", "HINGE"], label: "下肢代谢" },
      ], accessoryPatterns: ["CORE_BRACE", "MOBILITY"] },
  ]
  if (frequency >= 4) return SPLIT_4DAY
  if (frequency >= 3) return SPLIT_3DAY
  return SPLIT_3DAY.slice(0, frequency)
}

// ---- 中周期内周负荷 (3:1 波浪) ----
function getWeekLoad(weekInMeso: number, totalWeeks: number): { sets: number; intensityPct: number; rpe: number; label: string } {
  if (totalWeeks <= 2) {
    return weekInMeso === 0
      ? { sets: 3, intensityPct: 0.75, rpe: 7, label: "训练周" }
      : { sets: 2, intensityPct: 0.65, rpe: 5, label: "减载周" }
  }

  // 标准3:1模式: 3周递增 + 1周减载 (最后一周减载)
  if (weekInMeso === totalWeeks - 1) {
    return { sets: 2, intensityPct: 0.60, rpe: 5, label: "减载周" }
  }

  const buildingWeeks = totalWeeks - 1
  const phase = weekInMeso / buildingWeeks
  return {
    sets: 3 + Math.floor(phase * 1.5),
    intensityPct: 0.72 + phase * 0.15,
    rpe: 6 + Math.floor(phase * 3),
    label: weekInMeso === 0 ? "适应周" : weekInMeso === buildingWeeks - 1 ? "冲击周" : "进阶周",
  }
}

// ---- 动作选择引擎 ----
interface ExerciseRecord {
  id: string
  name: string
  sessionRole: string
  movementPattern: string
  category: string
  primaryMuscles: string
}

// 运动员个性化参数
interface AthleteProfile {
  sport: string
  discipline?: string | null
  trainingAge?: number | null
  height?: number | null
  weight?: number | null
  bodyFat?: number | null
  test1RM?: Record<string, number>  // 最新1RM测试数据
}

// 动作名称 → {测试字段, 比率}
// 比率: 该动作相对于测试1RM的重量比例
// 例: 保加利亚分腿蹲是单腿动作, 约为后蹲1RM的45%
const EXERCISE_TO_TEST: Record<string, { field: string; ratio: number }> = {
  // 深蹲及其变式
  "杠铃后蹲": { field: "深蹲", ratio: 1.0 },
  "杠铃前蹲": { field: "深蹲", ratio: 0.85 },
  "高脚杯深蹲": { field: "深蹲", ratio: 0.55 },
  "保加利亚分腿蹲": { field: "深蹲", ratio: 0.45 },
  "泽奇深蹲": { field: "深蹲", ratio: 0.75 },
  "过顶弓步": { field: "深蹲", ratio: 0.35 },
  "六角杠跳蹲": { field: "深蹲", ratio: 0.40 },
  "滑冰者蹲": { field: "深蹲", ratio: 0.30 },
  "负重弓步走": { field: "深蹲", ratio: 0.50 },
  "反向弓步": { field: "深蹲", ratio: 0.50 },
  // 硬拉及其变式
  "传统硬拉": { field: "硬拉", ratio: 1.0 },
  "六角杠硬拉": { field: "硬拉", ratio: 1.05 },
  "罗马尼亚硬拉": { field: "硬拉", ratio: 0.70 },
  "直腿硬拉": { field: "硬拉", ratio: 0.60 },
  "早安式": { field: "硬拉", ratio: 0.40 },
  "壶铃摆荡": { field: "硬拉", ratio: 0.30 },
  "山羊挺身": { field: "硬拉", ratio: 0.25 },
  "臀推": { field: "硬拉", ratio: 0.65 },
  // 卧推及其变式
  "杠铃卧推": { field: "卧推", ratio: 1.0 },
  "哑铃卧推": { field: "卧推", ratio: 0.70 },
  "哑铃上斜卧推": { field: "卧推", ratio: 0.60 },
  "爆发力俯卧撑": { field: "卧推", ratio: 0.30 },
  // 实力推举及其变式
  "实力推举": { field: "实力推举", ratio: 1.0 },
  "借力推举": { field: "实力推举", ratio: 1.10 },
  "坐姿哑铃推举": { field: "实力推举", ratio: 0.70 },
  "单臂哑铃借力推举": { field: "实力推举", ratio: 0.45 },
  // 爆发力/奥举 — 基于高翻或硬拉
  "膝上高翻": { field: "高翻", ratio: 1.0 },
  "杠铃高拉": { field: "高翻", ratio: 1.05 },
  "杠铃高抓": { field: "高翻", ratio: 0.75 },
  "哑铃抓举(单臂)": { field: "高翻", ratio: 0.40 },
  "负重登阶": { field: "高翻", ratio: 0.55 },
  "壶铃抓举间歇": { field: "高翻", ratio: 0.35 },
  // 引体/下拉/划船
  "负重引体向上": { field: "深蹲", ratio: 0.35 },
  "高位下拉": { field: "深蹲", ratio: 0.40 },
  "杠铃划船": { field: "硬拉", ratio: 0.55 },
  "坐姿绳索划船": { field: "硬拉", ratio: 0.45 },
  "单臂哑铃划船": { field: "硬拉", ratio: 0.30 },
  "地雷管旋转推": { field: "实力推举", ratio: 0.50 },
  "双杠臂屈伸": { field: "卧推", ratio: 0.60 },
}

// 爆发力动作如果没高翻数据，回退到硬拉
const POWER_FALLBACK: Record<string, { field: string; ratio: number }> = {
  "膝上高翻": { field: "硬拉", ratio: 0.55 },
  "杠铃高拉": { field: "硬拉", ratio: 0.60 },
  "杠铃高抓": { field: "硬拉", ratio: 0.45 },
  "哑铃抓举(单臂)": { field: "硬拉", ratio: 0.25 },
  "负重登阶": { field: "深蹲", ratio: 0.40 },
  "壶铃抓举间歇": { field: "硬拉", ratio: 0.20 },
}

// 根据运动员测试数据和%1RM计算实际重量
function calcWeight(exerciseName: string, intensityPct: number, profile?: AthleteProfile): { notes: string; actualKg: number | null } {
  if (!profile?.test1RM) return { notes: "", actualKg: null }

  let mapping = EXERCISE_TO_TEST[exerciseName]
  let fallbackUsed = false

  // 如果没有直接映射或测试数据缺失，尝试回退
  if (mapping && !profile.test1RM[mapping.field]) {
    const fb = POWER_FALLBACK[exerciseName]
    if (fb && profile.test1RM[fb.field]) {
      mapping = fb
      fallbackUsed = true
    }
  }

  if (!mapping) return { notes: "", actualKg: null }

  const max = profile.test1RM[mapping.field]
  if (!max || max <= 0) return { notes: "", actualKg: null }

  const effectiveMax = max * mapping.ratio
  const kg = Math.round(effectiveMax * intensityPct / 2.5) * 2.5
  const note = mapping.ratio === 1.0 && !fallbackUsed
    ? `基于1RM ${max}kg`
    : fallbackUsed
      ? `基于${mapping.field}1RM ${max}kg`
      : `基于${mapping.field}1RM ${max}kg (比率${Math.round(mapping.ratio * 100)}%)`

  return { notes: note, actualKg: kg }
}

// 不同训练阶段的动作轮换表
// 每个动作模式在不同阶段使用不同变式，让刺激多样化
const PHASE_EXERCISE_MAP: Record<string, { pattern: string; names: string[] }> = {
  // 深蹲变式按阶段轮换
  SQUAT_HYPERTROPHY: { pattern: "SQUAT", names: ["杠铃后蹲", "高脚杯深蹲", "保加利亚分腿蹲", "负重弓步走"] },
  SQUAT_STRENGTH:   { pattern: "SQUAT", names: ["杠铃后蹲", "杠铃前蹲", "保加利亚分腿蹲", "反向弓步"] },
  SQUAT_POWER:      { pattern: "SQUAT", names: ["泽奇深蹲", "六角杠跳蹲", "过顶弓步", "负重登阶"] },
  SQUAT_PEAKING:    { pattern: "SQUAT", names: ["杠铃后蹲", "杠铃前蹲", "六角杠跳蹲", "泽奇深蹲"] },
  // 铰链变式
  HINGE_HYPERTROPHY: { pattern: "HINGE", names: ["传统硬拉", "罗马尼亚硬拉", "臀推", "六角杠硬拉"] },
  HINGE_STRENGTH:    { pattern: "HINGE", names: ["传统硬拉", "六角杠硬拉", "罗马尼亚硬拉", "早安式"] },
  HINGE_POWER:       { pattern: "HINGE", names: ["直腿硬拉", "壶铃摆荡", "臀推", "山羊挺身"] },
  HINGE_PEAKING:     { pattern: "HINGE", names: ["传统硬拉", "六角杠硬拉", "直腿硬拉", "壶铃摆荡"] },
  // 水平推
  PUSH_H_HYPERTROPHY: { pattern: "PUSH_HORIZONTAL", names: ["杠铃卧推", "哑铃卧推", "哑铃上斜卧推"] },
  PUSH_H_STRENGTH:    { pattern: "PUSH_HORIZONTAL", names: ["杠铃卧推", "哑铃卧推", "哑铃上斜卧推"] },
  PUSH_H_POWER:       { pattern: "PUSH_HORIZONTAL", names: ["爆发力俯卧撑", "哑铃卧推", "杠铃卧推"] },
  PUSH_H_PEAKING:     { pattern: "PUSH_HORIZONTAL", names: ["杠铃卧推", "爆发力俯卧撑", "哑铃上斜卧推"] },
  // 垂直推
  PUSH_V_HYPERTROPHY: { pattern: "PUSH_VERTICAL", names: ["实力推举", "坐姿哑铃推举", "借力推举"] },
  PUSH_V_STRENGTH:    { pattern: "PUSH_VERTICAL", names: ["实力推举", "借力推举", "坐姿哑铃推举"] },
  PUSH_V_POWER:       { pattern: "PUSH_VERTICAL", names: ["借力推举", "单臂哑铃借力推举", "药球过顶抛"] },
  PUSH_V_PEAKING:     { pattern: "PUSH_VERTICAL", names: ["借力推举", "实力推举", "单臂哑铃借力推举"] },
  // 垂直拉
  PULL_V_HYPERTROPHY: { pattern: "PULL_VERTICAL", names: ["高位下拉", "负重引体向上", "毛巾引体向上"] },
  PULL_V_STRENGTH:    { pattern: "PULL_VERTICAL", names: ["负重引体向上", "高位下拉", "毛巾引体向上"] },
  PULL_V_POWER:       { pattern: "PULL_VERTICAL", names: ["负重引体向上", "高位下拉", "毛巾引体向上"] },
  PULL_V_PEAKING:     { pattern: "PULL_VERTICAL", names: ["负重引体向上", "高位下拉", "毛巾引体向上"] },
  // 水平拉
  PULL_H_HYPERTROPHY: { pattern: "PULL_HORIZONTAL", names: ["杠铃划船", "坐姿绳索划船", "单臂哑铃划船"] },
  PULL_H_STRENGTH:    { pattern: "PULL_HORIZONTAL", names: ["杠铃划船", "坐姿绳索划船", "单臂哑铃划船"] },
  PULL_H_POWER:       { pattern: "PULL_HORIZONTAL", names: ["杠铃划船", "坐姿绳索划船", "弹力带水平拉"] },
  PULL_H_PEAKING:     { pattern: "PULL_HORIZONTAL", names: ["杠铃划船", "坐姿绳索划船", "单臂哑铃划船"] },
  // 爆发力/快速伸缩
  PLYO_HYPERTROPHY:   { pattern: "PLYOMETRIC", names: ["跳箱", "药球下砸", "小障碍栏跳跃"] },
  PLYO_STRENGTH:      { pattern: "PLYOMETRIC", names: ["跳箱", "深度跳", "杠铃高拉", "小障碍栏跳跃"] },
  PLYO_POWER:         { pattern: "PLYOMETRIC", names: ["膝上高翻", "杠铃高抓", "杠铃高拉", "深度跳", "哑铃抓举(单臂)"] },
  PLYO_PEAKING:       { pattern: "PLYOMETRIC", names: ["膝上高翻", "杠铃高抓", "杠铃高拉", "跳箱"] },
}

// 按阶段获取动作名列表
function getPhaseExerciseNames(pattern: string, phase: string): string[] {
  const key = `${pattern}_${phase}`
  const entry = PHASE_EXERCISE_MAP[key]
  if (entry) return entry.names
  // 回退到任意阶段的列表
  for (const [k, v] of Object.entries(PHASE_EXERCISE_MAP)) {
    if (k.startsWith(pattern + "_")) return v.names
  }
  return []
}

function pickExercise(pool: ExerciseRecord[], patterns: string[], weekOffset: number, slotIndex: number, phase: string): ExerciseRecord | null {
  // 优先从阶段轮换表中按名称匹配
  for (const pattern of patterns) {
    const preferredNames = getPhaseExerciseNames(pattern, phase)
    if (preferredNames.length > 0) {
      const matched = pool.filter(e => preferredNames.includes(e.name) && e.sessionRole === "MAIN")
      if (matched.length > 0) {
        return matched[(weekOffset + slotIndex) % matched.length]
      }
    }
  }
  // 回退：从动作模式匹配
  const candidates = pool.filter(e => patterns.some(p => e.movementPattern === p) && e.sessionRole === "MAIN")
  if (candidates.length === 0) return null
  return candidates[(weekOffset * 7 + slotIndex * 3) % candidates.length]
}

// 根据运动员数据调整训练参数
function applyAthleteProfile(phase: string, profile?: AthleteProfile): { extraNotes: string; adjustSets: number } {
  let extraNotes = ""
  let adjustSets = 0

  if (!profile) return { extraNotes, adjustSets }

  // 新手减量
  if (profile.trainingAge && profile.trainingAge < 2) {
    adjustSets -= 1
    extraNotes += "新手适应"
  }
  // 高体脂加代谢
  if (profile.bodyFat && profile.bodyFat > 20) {
    extraNotes += extraNotes ? "·减脂期" : "减脂期"
  }
  // 大体重运动员保护关节
  if (profile.weight && profile.weight > 100) {
    extraNotes += extraNotes ? "·关节保护" : "关节保护"
  }
  // 高个子强调核心
  if (profile.height && profile.height > 190) {
    extraNotes += extraNotes ? "·核心强化" : "核心强化"
  }

  return { extraNotes, adjustSets }
}

function pickWarmup(pool: ExerciseRecord[], patterns: string[], count: number, offset: number) {
  const result: ExerciseRecord[] = []
  const candidates = pool.filter(e => e.sessionRole === "WARMUP" && patterns.some(p => e.movementPattern === p))
  for (let i = 0; i < count && i < candidates.length; i++) {
    result.push(candidates[(offset + i) % candidates.length])
  }
  if (result.length < count) {
    const general = pool.filter(e => e.sessionRole === "WARMUP" && !result.includes(e))
    for (let i = 0; result.length < count && i < general.length; i++) {
      result.push(general[(offset + i) % general.length])
    }
  }
  return result
}

function pickAccessory(pool: ExerciseRecord[], patterns: string[], count: number, offset: number) {
  const result: ExerciseRecord[] = []
  const candidates = pool.filter(e => e.sessionRole === "ACCESSORY" && patterns.some(p => e.movementPattern === p || matchesMuscleGroup(e, p)))
  for (let i = 0; i < count && i < candidates.length; i++) {
    result.push(candidates[(offset + i) % candidates.length])
  }
  if (result.length < count) {
    const general = pool.filter(e => e.sessionRole === "ACCESSORY" && !result.includes(e))
    for (let i = 0; result.length < count && i < general.length; i++) {
      result.push(general[(offset + i) % general.length])
    }
  }
  return result
}

function matchesMuscleGroup(ex: ExerciseRecord, target: string): boolean {
  try {
    const muscles = JSON.parse(ex.primaryMuscles)
    const map: Record<string, string> = {
      "FOREARMS": "FOREARMS", "CORE_BRACE": "RECTUS_ABDOMINIS",
    }
    return muscles.includes(map[target] ?? target)
  } catch { return false }
}

// ---- 主生成函数 ----
export interface GenerateInput {
  userId: string
  sport: string
  goal: string
  periodizationModel: string
  durationWeeks: number
  trainingFrequency: number
  name: string
  athleteId?: string | null
}

export interface PrescriptionData {
  exerciseId: string; order: number; sets: number; reps: string
  loadType: string; loadValue: number; restSeconds: number; notes: string | null
}

export function buildProgramStructure(input: GenerateInput) {
  const { sport, goal, periodizationModel, durationWeeks, trainingFrequency: freq, name } = input
  const needs = SPORT_NEEDS[sport]
  const phases = getPhaseTemplate(sport, durationWeeks)
  const split = getSplit(freq)

  const startDate = new Date()
  return {
    programData: {
      name: name || `${needs?.sport ?? sport} ${durationWeeks}周训练计划`,
      sport, goal, periodizationModel,
      trainingFrequency: freq,
      startDate: startDate.toISOString().split("T")[0],
      endDate: new Date(startDate.getTime() + durationWeeks * 7 * 86400000).toISOString().split("T")[0],
      status: "DRAFT" as const,
    },
    phases, split, needs, freq,
  }
}

export function generateMesoStructure(
  phases: ReturnType<typeof getPhaseTemplate>,
  programId: string,
  phaseIdx: number,
  phaseStart: Date,
) {
  const phaseConfig = phases[phaseIdx]
  const mesoEnd = new Date(phaseStart.getTime() + phaseConfig.weeks * 7 * 86400000)
  const loading = LOADING_PARAMS[phaseConfig.goal] ?? LOADING_PARAMS["MAX_STRENGTH"]

  return {
    mesoData: {
      programId,
      name: phaseConfig.name,
      phase: phaseConfig.phase,
      goal: phaseConfig.goal,
      order: phaseIdx + 1,
      startDate: phaseStart.toISOString().split("T")[0],
      endDate: mesoEnd.toISOString().split("T")[0],
      notes: phaseConfig.focus,
    },
    weeks: phaseConfig.weeks,
    loading,
    mesoEnd,
  }
}

export function buildWeekPrescriptions(
  exercises: ExerciseRecord[],
  split: SessionPlan[],
  loading: (typeof LOADING_PARAMS)[keyof typeof LOADING_PARAMS],
  freq: number,
  weekInMeso: number,
  totalWeeks: number,
  weekStart: Date,
  phaseIdx: number,
  mesoPhase: string,
  athleteProfile?: AthleteProfile,
) {
  const weekLoad = getWeekLoad(weekInMeso, totalWeeks)
  const microEnd = new Date(weekStart.getTime() + 6 * 86400000)
  const { extraNotes, adjustSets } = applyAthleteProfile(mesoPhase, athleteProfile)

  const microData = {
    weekNumber: weekInMeso + 1,
    startDate: weekStart.toISOString().split("T")[0],
    endDate: microEnd.toISOString().split("T")[0],
    theme: `第${weekInMeso + 1}周 · ${weekLoad.label}${extraNotes ? ` · ${extraNotes}` : ""}`,
  }

  const sessions: {
    sessionData: { dayOfWeek: number; date: string; sessionType: string; name: string; order: number }
    prescriptions: PrescriptionData[]
  }[] = []

  for (let d = 0; d < freq; d++) {
    const plan = split[d % split.length]
    const sessionDate = new Date(weekStart.getTime() + plan.dayOfWeek * 86400000)
    const globalOffset = (phaseIdx * 31 + weekInMeso * 7 + d) * 3

    const prescriptions: PrescriptionData[] = []
    let order = 0

    // 热身激活: 3个动作 × 1-2组
    const warmupExs = pickWarmup(exercises, plan.warmupPatterns, 3, globalOffset)
    for (const ex of warmupExs) {
      prescriptions.push({
        exerciseId: ex.id, order: ++order,
        sets: 1 + (order % 2), reps: "8-15",
        loadType: "RPE", loadValue: 4 + (order % 3),
        restSeconds: 30, notes: "热身激活",
      })
    }

    // 主体训练: 3个动作 × 3-4组 (根据运动员调整组数)
    for (let s = 0; s < plan.mainSlots.length; s++) {
      const slot = plan.mainSlots[s]
      const ex = pickExercise(exercises, slot.pattern, globalOffset, s, mesoPhase)
      if (!ex) continue

      const sets = Math.max(1, weekLoad.sets + adjustSets)
      const intensity = weekLoad.intensityPct
      const { notes: weightNote, actualKg } = calcWeight(ex.name, intensity, athleteProfile)

      let note = `${slot.label} · ${weekLoad.label}`
      let loadType = weekLoad.label === "减载周" ? "RPE" : "PERCENT_1RM"
      let loadValue = weekLoad.label === "减载周" ? weekLoad.rpe : Math.round(intensity * 100)

      if (actualKg) {
        loadType = "ABSOLUTE_LOAD"
        loadValue = actualKg
        note = `${slot.label} · ${Math.round(intensity * 100)}%1RM · ${weekLoad.label}`
      }

      prescriptions.push({
        exerciseId: ex.id, order: ++order,
        sets,
        reps: `${loading.reps.min}-${loading.reps.max}`,
        loadType,
        loadValue,
        restSeconds: loading.restSeconds.min + 30,
        notes: note,
      })
    }

    // 辅助训练: 2个动作 × 2-3组
    const accExs = pickAccessory(exercises, plan.accessoryPatterns, 2, globalOffset)
    for (const ex of accExs) {
      prescriptions.push({
        exerciseId: ex.id, order: ++order,
        sets: 2 + (order % 2), reps: "10-15",
        loadType: "RPE", loadValue: 6 + (order % 2),
        restSeconds: 45, notes: "辅助训练",
      })
    }

    sessions.push({
      sessionData: {
        dayOfWeek: plan.dayOfWeek, date: sessionDate.toISOString().split("T")[0],
        sessionType: plan.sessionType, name: plan.name, order: d,
      },
      prescriptions,
    })
  }

  return { microData, sessions }
}
