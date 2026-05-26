// 运动专项需求分析引擎

export interface SportNeeds {
  sport: string
  primaryEnergySystem: string[]
  priorityMovementPatterns: string[]
  specialDemands: string[]
  commonInjuries: string[]
  weightClassSport: boolean
  recommendedGoals: string[]
}

export interface PhaseConfig {
  name: string; phase: string; weeks: number; goal: string
  setsReps: string; loadRange: string; frequency: number; focus: string
}

type SportNeedsMap = Record<string, SportNeeds>

// ---- 格斗类 ----
const COMBAT_BASE: SportNeeds = {
  sport: "", primaryEnergySystem: ["ATP-PC", "糖酵解"],
  priorityMovementPatterns: ["ROTATION","PUSH_HORIZONTAL","CORE_BRACE","HINGE","PULL_VERTICAL","CARRY"],
  specialDemands: ["旋转爆发力","核心抗旋","等长力量(缠斗)","无氧间歇耐力"],
  commonInjuries: ["肩关节","膝关节","颈部","手腕"],
  weightClassSport: true, recommendedGoals: ["SPORT_PERFORMANCE","POWER","MAX_STRENGTH"],
}

export const SPORT_NEEDS: SportNeedsMap = {
  BOXING: { ...COMBAT_BASE, sport: "拳击", specialDemands: ["旋转爆发力(出拳)","肩部耐力","颈部抗击打","无氧间歇耐力","体重级别管理"], commonInjuries: ["肩关节","手腕","脑震荡","肋骨"] },
  KICKBOXING: { ...COMBAT_BASE, sport: "踢拳", specialDemands: ["腿法爆发力","髋关节灵活性","旋转爆发力","无氧间歇耐力","体重级别管理"], commonInjuries: ["胫骨","髋关节","肩关节"] },
  MUAY_THAI: { ...COMBAT_BASE, sport: "泰拳", specialDemands: ["膝肘爆发力","颈部力量(箍颈)","髋灵活性","无氧间歇耐力","体重级别管理"], commonInjuries: ["胫骨","肘部","颈部"] },
  SANDA: { ...COMBAT_BASE, sport: "散打", specialDemands: ["摔投爆发力","腿法速度","抗摔核心","无氧间歇耐力","体重级别管理"], commonInjuries: ["膝关节","踝关节","肩关节"] },
  MMA: { ...COMBAT_BASE, sport: "综合格斗", primaryEnergySystem: ["ATP-PC","糖酵解","有氧"], specialDemands: ["握力(地面控制)","颈部力量(防锁)","旋转爆发力(打击)","等长力量(缠斗)","无氧+有氧混合"], commonInjuries: ["膝关节","肩关节","颈部","耳廓","肋骨"] },
  WRESTLING: { ...COMBAT_BASE, sport: "摔跤", primaryEnergySystem: ["糖酵解","ATP-PC"], priorityMovementPatterns: ["HINGE","PULL_HORIZONTAL","PULL_VERTICAL","CORE_BRACE","CARRY","SQUAT"], specialDemands: ["握力耐力(把位)","颈部力量(桥/防锁)","爆发力(摔投)","等长力量(对抗)","体重级别管理"], commonInjuries: ["膝关节","肩关节","颈部","耳廓","肋骨"] },
  JUDO: { ...COMBAT_BASE, sport: "柔道", priorityMovementPatterns: ["PULL_HORIZONTAL","PULL_VERTICAL","HINGE","ROTATION","CORE_BRACE","CARRY"], specialDemands: ["握力(道衣袖领)","旋转爆发力(投技)","核心抗旋","爆发力代谢","体重级别管理"], commonInjuries: ["肩关节","膝关节","手指","肘部"] },
  BJJ: { ...COMBAT_BASE, sport: "巴西柔术", primaryEnergySystem: ["糖酵解","有氧"], priorityMovementPatterns: ["PULL_HORIZONTAL","CORE_BRACE","HINGE","ROTATION","CARRY"], specialDemands: ["握力耐力(道服把位)","核心抗旋","等长力量","髋关节灵活性","体重级别管理"], commonInjuries: ["膝关节","肩关节","手指","耳廓"] },
  TAEKWONDO: { ...COMBAT_BASE, sport: "跆拳道", specialDemands: ["腿法速度和高度","髋关节活动度","爆发力(踢击)","灵敏性","体重级别管理"], commonInjuries: ["踝关节","膝关节","髋关节","足部"] },

  // ---- 球类 ----
  BASKETBALL: {
    sport: "篮球", primaryEnergySystem: ["ATP-PC","糖酵解"],
    priorityMovementPatterns: ["PLYOMETRIC","SQUAT","PUSH_VERTICAL","GAIT","CORE_BRACE"],
    specialDemands: ["垂直弹跳","变向敏捷","重复冲刺","核心稳定","上肢对抗力量"],
    commonInjuries: ["踝关节","膝关节","腘绳肌","肩关节","腹股沟"],
    weightClassSport: false, recommendedGoals: ["POWER","SPORT_PERFORMANCE","MAX_STRENGTH"],
  },
  FOOTBALL: {
    sport: "足球", primaryEnergySystem: ["ATP-PC","糖酵解","有氧"],
    priorityMovementPatterns: ["GAIT","SQUAT","PLYOMETRIC","CORE_BRACE","HINGE"],
    specialDemands: ["变向冲刺","单腿稳定性","有氧耐力","腘绳肌力量","下肢爆发力"],
    commonInjuries: ["腘绳肌","踝关节","膝关节","腹股沟","前交叉韧带"],
    weightClassSport: false, recommendedGoals: ["SPORT_PERFORMANCE","POWER","SPEED"],
  },
  VOLLEYBALL: {
    sport: "排球", primaryEnergySystem: ["ATP-PC"],
    priorityMovementPatterns: ["PLYOMETRIC","PUSH_VERTICAL","SQUAT","CORE_BRACE","ROTATION"],
    specialDemands: ["垂直弹跳","肩部爆发力","核心抗旋","反应敏捷","落地缓冲"],
    commonInjuries: ["肩关节","踝关节","膝关节","手指","下背"],
    weightClassSport: false, recommendedGoals: ["POWER","SPORT_PERFORMANCE","MAX_STRENGTH"],
  },
  RUGBY: {
    sport: "橄榄球", primaryEnergySystem: ["ATP-PC","糖酵解"],
    priorityMovementPatterns: ["SQUAT","HINGE","PUSH_HORIZONTAL","GAIT","CORE_BRACE"],
    specialDemands: ["爆发力(突破)","冲撞耐受","速度耐力","全身力量","颈部力量"],
    commonInjuries: ["肩关节","膝关节","脑震荡","腘绳肌","踝关节"],
    weightClassSport: false, recommendedGoals: ["MAX_STRENGTH","POWER","SPORT_PERFORMANCE"],
  },
  TENNIS: {
    sport: "网球", primaryEnergySystem: ["ATP-PC","糖酵解"],
    priorityMovementPatterns: ["ROTATION","GAIT","PUSH_VERTICAL","CORE_BRACE","SQUAT"],
    specialDemands: ["旋转爆发力(发球/正手)","侧向移动","反应敏捷","肩部耐力","单侧力量平衡"],
    commonInjuries: ["肩关节","肘部(网球肘)","踝关节","下背","膝关节"],
    weightClassSport: false, recommendedGoals: ["POWER","SPORT_PERFORMANCE","SPEED"],
  },
  BADMINTON: {
    sport: "羽毛球", primaryEnergySystem: ["ATP-PC","糖酵解"],
    priorityMovementPatterns: ["GAIT","ROTATION","PUSH_VERTICAL","PLYOMETRIC","CORE_BRACE"],
    specialDemands: ["多方向敏捷","反应速度","肩部爆发力+耐力","踝关节刚性"],
    commonInjuries: ["踝关节","膝关节","肩关节","肘部","跟腱"],
    weightClassSport: false, recommendedGoals: ["SPEED","POWER","SPORT_PERFORMANCE"],
  },

  // ---- 田径 ----
  SPRINT: {
    sport: "短跑", primaryEnergySystem: ["ATP-PC","糖酵解"],
    priorityMovementPatterns: ["GAIT","PLYOMETRIC","SQUAT","HINGE","CORE_BRACE"],
    specialDemands: ["启动爆发力","最大速度","腘绳肌力量(摆动期)","踝关节刚性","反应速度"],
    commonInjuries: ["腘绳肌","跟腱","踝关节","髋屈肌","下背"],
    weightClassSport: false, recommendedGoals: ["POWER","SPEED","MAX_STRENGTH"],
  },
  DISTANCE_RUN: {
    sport: "中长跑", primaryEnergySystem: ["有氧","糖酵解"],
    priorityMovementPatterns: ["GAIT","SQUAT","HINGE","CORE_BRACE","PLYOMETRIC"],
    specialDemands: ["有氧耐力","跑步经济性","下肢力量耐力","核心稳定","损伤预防"],
    commonInjuries: ["胫骨","足底筋膜","髂胫束","腘绳肌","跟腱"],
    weightClassSport: false, recommendedGoals: ["MUSCULAR_ENDURANCE","GENERAL_FITNESS","INJURY_PREVENTION"],
  },

  // ---- 水上 ----
  SWIMMING: {
    sport: "游泳", primaryEnergySystem: ["ATP-PC","有氧"],
    priorityMovementPatterns: ["PULL_VERTICAL","PULL_HORIZONTAL","PUSH_VERTICAL","CORE_BRACE","SQUAT"],
    specialDemands: ["肩部力量和耐力","核心稳定","髋驱动(蛙泳/蝶泳)","上肢拉力量","柔韧性"],
    commonInjuries: ["肩关节(游泳肩)","下背","膝关节(蛙泳)","颈部"],
    weightClassSport: false, recommendedGoals: ["MUSCULAR_ENDURANCE","MAX_STRENGTH","POWER"],
  },

  // ---- 力量型 ----
  WEIGHTLIFTING: {
    sport: "举重", primaryEnergySystem: ["ATP-PC"],
    priorityMovementPatterns: ["SQUAT","HINGE","PUSH_VERTICAL","PLYOMETRIC","CORE_BRACE"],
    specialDemands: ["爆发力(抓举/挺举)","最大力量","全身协调","关节活动度","杠铃技术"],
    commonInjuries: ["下背","膝关节","肩关节","手腕","肘部"],
    weightClassSport: true, recommendedGoals: ["POWER","MAX_STRENGTH","PEAKING"],
  },
  POWERLIFTING: {
    sport: "力量举", primaryEnergySystem: ["ATP-PC"],
    priorityMovementPatterns: ["SQUAT","HINGE","PUSH_HORIZONTAL","CORE_BRACE"],
    specialDemands: ["最大绝对力量(深蹲/卧推/硬拉)","神经募集","关节稳定性","渐进超负荷"],
    commonInjuries: ["下背","肩关节","膝关节","髋关节"],
    weightClassSport: true, recommendedGoals: ["MAX_STRENGTH","PEAKING","HYPERTROPHY"],
  },
  CROSSFIT: {
    sport: "综合体能", primaryEnergySystem: ["ATP-PC","糖酵解","有氧"],
    priorityMovementPatterns: ["SQUAT","HINGE","PUSH_VERTICAL","PULL_VERTICAL","PLYOMETRIC","CORE_BRACE"],
    specialDemands: ["全面体能(力量+爆发力+耐力)","体操基础","奥举技术","高强度间歇","功能性训练"],
    commonInjuries: ["肩关节","下背","膝关节","手腕"],
    weightClassSport: false, recommendedGoals: ["SPORT_PERFORMANCE","GENERAL_FITNESS","POWER"],
  },
  BODYBUILDING: {
    sport: "健美/塑形", primaryEnergySystem: ["ATP-PC","糖酵解"],
    priorityMovementPatterns: ["SQUAT","HINGE","PUSH_HORIZONTAL","PUSH_VERTICAL","PULL_HORIZONTAL","PULL_VERTICAL"],
    specialDemands: ["肌肥大","对称性","小肌群孤立","体成分管理","训练量累积"],
    commonInjuries: ["肩关节","下背","肘部","膝关节"],
    weightClassSport: false, recommendedGoals: ["HYPERTROPHY","BODY_COMPOSITION","MUSCULAR_ENDURANCE"],
  },

  // ---- 通用/大众 ----
  GENERAL_FITNESS: {
    sport: "大众健身", primaryEnergySystem: ["ATP-PC","糖酵解","有氧"],
    priorityMovementPatterns: ["SQUAT","HINGE","PUSH_HORIZONTAL","PUSH_VERTICAL","PULL_HORIZONTAL","PULL_VERTICAL","CORE_BRACE"],
    specialDemands: ["综合体能发展","体成分改善","功能性训练","健康促进"],
    commonInjuries: ["下背","膝关节","肩关节"],
    weightClassSport: false, recommendedGoals: ["GENERAL_FITNESS","HYPERTROPHY","BODY_COMPOSITION"],
  },
}

// 比赛项目→训练阶段模板（通用版）
export function getPhaseTemplate(sport: string, durationWeeks: number): PhaseConfig[] {
  const needs = SPORT_NEEDS[sport]
  const isWeightClass = needs?.weightClassSport ?? false
  const isStrength = sport === "WEIGHTLIFTING" || sport === "POWERLIFTING" || sport === "BODYBUILDING"
  const isEndurance = sport === "DISTANCE_RUN" || sport === "SWIMMING"

  if (isStrength) {
    const hypertrophy = Math.max(3, Math.floor(durationWeeks * 0.3))
    const strength = Math.max(3, Math.floor(durationWeeks * 0.4))
    const peaking = durationWeeks - hypertrophy - strength
    return [
      { name: "肌肥大积累期", phase: "HYPERTROPHY", weeks: hypertrophy, goal: "HYPERTROPHY", setsReps: "3-4x8-12", loadRange: "67-80%", frequency: 4, focus: "肌肥大、训练量积累、技术打磨" },
      { name: "力量发展期", phase: "STRENGTH", weeks: strength, goal: "MAX_STRENGTH", setsReps: "3-5x3-5", loadRange: "80-90%", frequency: 4, focus: "最大力量、神经募集效率" },
      { name: "峰值/减载期", phase: "PEAKING", weeks: peaking, goal: "PEAKING", setsReps: "2-3x1-3", loadRange: "85-95%", frequency: 3, focus: "峰值力量、技术精细、减载" },
    ]
  }

  if (isEndurance) {
    const strength = Math.max(3, Math.floor(durationWeeks * 0.4))
    const power = Math.max(2, Math.floor(durationWeeks * 0.3))
    const maint = durationWeeks - strength - power
    return [
      { name: "基础力量期", phase: "STRENGTH", weeks: strength, goal: "MAX_STRENGTH", setsReps: "3-4x5-8", loadRange: "75-85%", frequency: 2, focus: "力量基础、损伤预防、跑步经济性" },
      { name: "爆发力转化期", phase: "POWER", weeks: power, goal: "POWER", setsReps: "3-4x3-5", loadRange: "75-85%", frequency: 2, focus: "爆发力、快速伸缩、踝关节刚性" },
      { name: "赛季维持期", phase: "COMPETITION", weeks: maint, goal: "SPORT_PERFORMANCE", setsReps: "2x3-5", loadRange: "70-80%", frequency: 1, focus: "维持力量、避免疲劳累积" },
    ]
  }

  if (isWeightClass) {
    const gpp = Math.max(2, Math.floor(durationWeeks * 0.2))
    const spp = Math.max(2, Math.floor(durationWeeks * 0.3))
    const peaking = Math.max(2, Math.floor(durationWeeks * 0.25))
    const comp = Math.max(1, Math.floor(durationWeeks * 0.1))
    const remaining = durationWeeks - gpp - spp - peaking - comp
    return [
      { name: "一般准备期(GPP)", phase: "GENERAL_PREPARATION", weeks: gpp, goal: "HYPERTROPHY", setsReps: "3-4x8-12", loadRange: "67-75%", frequency: 3, focus: "基础体能重建、肌肥大、有氧基础" },
      { name: "专项准备期(SPP)", phase: "SPECIFIC_PREPARATION", weeks: spp + (remaining > 0 ? Math.floor(remaining / 2) : 0), goal: "MAX_STRENGTH", setsReps: "3-5x3-5", loadRange: "80-90%", frequency: 3, focus: "最大力量、专项爆发力转化" },
      { name: "赛前力量期", phase: "STRENGTH", weeks: Math.max(1, remaining - Math.floor(remaining / 2)), goal: "POWER", setsReps: "3-5x1-3", loadRange: "75-90%", frequency: 2, focus: "爆发力、比赛模拟强度" },
      { name: "赛前峰值期", phase: "PEAKING", weeks: peaking, goal: "PEAKING", setsReps: "2-3x1-3", loadRange: "85-95%", frequency: 2, focus: "峰值爆发力、神经激活" },
      { name: "比赛周", phase: "COMPETITION", weeks: comp, goal: "PEAKING", setsReps: "1-2x1-3(轻)", loadRange: "50-70%", frequency: 1, focus: "恢复+神经激活、体重管理" },
    ]
  }

  // 通用球类/运动表现
  const hypertrophy = Math.max(3, Math.floor(durationWeeks * 0.25))
  const strength = Math.max(4, Math.floor(durationWeeks * 0.35))
  const power = durationWeeks - hypertrophy - strength - 3
  const transition = 3
  return [
    { name: "肌肥大+基础期", phase: "HYPERTROPHY", weeks: hypertrophy, goal: "HYPERTROPHY", setsReps: "3-4x8-12", loadRange: "67-80%", frequency: 4, focus: "肌肥大、基础力量、纠正性训练" },
    { name: "最大力量期", phase: "STRENGTH", weeks: strength, goal: "MAX_STRENGTH", setsReps: "3-5x3-5", loadRange: "80-90%", frequency: 3, focus: "最大力量、爆发力基础" },
    { name: "爆发力+专项转化期", phase: "POWER", weeks: power, goal: "POWER", setsReps: "3-5x1-3", loadRange: "75-85%", frequency: 3, focus: "专项体能转化、速度敏捷" },
    { name: "过渡/恢复期", phase: "TRANSITION", weeks: transition, goal: "GENERAL_FITNESS", setsReps: "2-3x8-12", loadRange: "60-70%", frequency: 2, focus: "主动恢复、损伤筛查" },
  ]
}
