// NSCA 训练负荷参数表 (基于 CSCS 第4版)

export interface LoadingParams {
  percent1RM: { min: number; max: number }
  sets: { min: number; max: number }
  reps: { min: number; max: number }
  restSeconds: { min: number; max: number }
  description: string
}

export const LOADING_PARAMS: Record<string, LoadingParams> = {
  HYPERTROPHY: {
    percent1RM: { min: 67, max: 85 },
    sets: { min: 3, max: 6 },
    reps: { min: 6, max: 12 },
    restSeconds: { min: 30, max: 90 },
    description: "肌肥大阶段：中高强度、中高训练量、较短间歇",
  },
  MAX_STRENGTH: {
    percent1RM: { min: 85, max: 100 },
    sets: { min: 2, max: 6 },
    reps: { min: 1, max: 6 },
    restSeconds: { min: 120, max: 300 },
    description: "最大力量阶段：高强度、低训练量、充分间歇",
  },
  POWER_SINGLE: {
    percent1RM: { min: 80, max: 90 },
    sets: { min: 3, max: 5 },
    reps: { min: 1, max: 2 },
    restSeconds: { min: 120, max: 300 },
    description: "爆发力(单次)：高强度、低次数、充分间歇",
  },
  POWER_MULTIPLE: {
    percent1RM: { min: 75, max: 85 },
    sets: { min: 3, max: 5 },
    reps: { min: 3, max: 5 },
    restSeconds: { min: 120, max: 300 },
    description: "爆发力(多次)：中高强度、中次数、充分间歇",
  },
  MUSCULAR_ENDURANCE: {
    percent1RM: { min: 50, max: 67 },
    sets: { min: 2, max: 3 },
    reps: { min: 12, max: 25 },
    restSeconds: { min: 15, max: 30 },
    description: "肌耐力阶段：低强度、高次数、短间歇",
  },
}

// 各训练阶段的负荷进阶模式
export function getLoadProgression(phase: string, week: number, peakWeek: number): number {
  switch (phase) {
    case "HYPERTROPHY":
      return 67 + (week / peakWeek) * 18
    case "STRENGTH":
      return 80 + (week / peakWeek) * 15
    case "POWER":
      return week <= peakWeek / 2 ? 75 + (week / (peakWeek / 2)) * 10 : 85
    case "PEAKING":
      return 85 + (week / peakWeek) * 10
    default:
      return 70
  }
}
