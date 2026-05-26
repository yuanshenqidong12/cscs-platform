// 运动项目 & 标签 & 需求分析 — 统一管理

export const SPORTS = [
  // 格斗类
  { value: "BOXING", label: "拳击", icon: "🥊" },
  { value: "KICKBOXING", label: "踢拳", icon: "🦵" },
  { value: "MUAY_THAI", label: "泰拳", icon: "🇹🇭" },
  { value: "SANDA", label: "散打", icon: "🇨🇳" },
  { value: "MMA", label: "综合格斗", icon: "🏆" },
  { value: "WRESTLING", label: "摔跤", icon: "🤼" },
  { value: "JUDO", label: "柔道", icon: "🥋" },
  { value: "BJJ", label: "巴西柔术", icon: "🟦" },
  { value: "TAEKWONDO", label: "跆拳道", icon: "👟" },
  { value: "KARATE", label: "空手道", icon: "🈳" },
  // 球类
  { value: "BASKETBALL", label: "篮球", icon: "🏀" },
  { value: "FOOTBALL", label: "足球", icon: "⚽" },
  { value: "VOLLEYBALL", label: "排球", icon: "🏐" },
  { value: "RUGBY", label: "橄榄球", icon: "🏉" },
  { value: "TENNIS", label: "网球", icon: "🎾" },
  { value: "BADMINTON", label: "羽毛球", icon: "🏸" },
  { value: "TABLE_TENNIS", label: "乒乓球", icon: "🏓" },
  // 田径
  { value: "TRACK_FIELD", label: "田径", icon: "🏃" },
  { value: "SPRINT", label: "短跑", icon: "💨" },
  { value: "DISTANCE_RUN", label: "中长跑", icon: "🏔️" },
  // 水上
  { value: "SWIMMING", label: "游泳", icon: "🏊" },
  // 力量
  { value: "WEIGHTLIFTING", label: "举重", icon: "🏋️" },
  { value: "POWERLIFTING", label: "力量举", icon: "💪" },
  { value: "CROSSFIT", label: "CrossFit/综合体能", icon: "🔱" },
  // 其他
  { value: "GENERAL_FITNESS", label: "大众健身", icon: "🏠" },
  { value: "BODYBUILDING", label: "健美/塑形", icon: "🗿" },
] as const

export const SPORT_LABELS: Record<string, string> = {}
for (const s of SPORTS) {
  SPORT_LABELS[s.value] = s.label
}
