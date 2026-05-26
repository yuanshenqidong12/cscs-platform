import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import bcrypt from "bcryptjs"
import path from "path"

process.env.DATABASE_URL = process.env.DATABASE_URL ?? "file:dev.db"

const dbPath = path.resolve(process.cwd(), "dev.db")
const adapter = new PrismaLibSql({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

// 辅助函数
function arr(v: string[]) { return JSON.stringify(v) }

interface ExSeed {
  name: string; nameEn?: string; category: string; movementPattern: string
  primaryMuscles: string; secondaryMuscles?: string; equipment: string
  difficulty: string; sessionRole: string
  coachingCues: string; commonErrors: string; isNscaStandard?: boolean
}

async function main() {
  console.log("Seeding database...")

  // ---- 教练 ----
  const pwd = await bcrypt.hash("admin123", 10)
  const coach = await prisma.user.upsert({
    where: { email: "coach@cscs.com" },
    update: {},
    create: { email: "coach@cscs.com", name: "王教练", passwordHash: pwd, role: "COACH", organization: "CSCS体能训练中心", certifications: JSON.stringify(["CSCS", "USAW"]) },
  })

  // ============================================================
  // 动作库 - 全部按 sessionRole 分类
  // ============================================================
  const exercises: ExSeed[] = [
    // -----------------------------------------------
    // 一、热身激活 (WARMUP) - 15个
    // -----------------------------------------------
    // -- 核心激活 --
    { name: "死虫式", nameEn: "Dead Bug", category: "CORE", movementPattern: "CORE_BRACE", primaryMuscles: arr(["TRANSVERSE_ABDOMINIS","RECTUS_ABDOMINIS"]), secondaryMuscles: arr(["HIP_FLEXORS"]), equipment: arr(["BODYWEIGHT"]), difficulty: "BEGINNER", sessionRole: "WARMUP", coachingCues: arr(["腰部完全贴地无空隙","缓慢对侧伸展","3秒下放","配合呼吸"]), commonErrors: arr(["腰部弓起离开地面","动作太快失控制"]) },
    { name: "鸟狗式", nameEn: "Bird Dog", category: "CORE", movementPattern: "CORE_BRACE", primaryMuscles: arr(["ERECTOR_SPINAE","RECTUS_ABDOMINIS","GLUTES"]), secondaryMuscles: arr(["ANTERIOR_DELTOID","HAMSTRINGS"]), equipment: arr(["BODYWEIGHT"]), difficulty: "BEGINNER", sessionRole: "WARMUP", coachingCues: arr(["四足跪姿","对侧手脚同时伸展","保持骨盆稳定不旋转","核心收紧"]), commonErrors: arr(["骨盆旋转","动作过快","伸展幅度过大失稳"]) },
    { name: "平板支撑", nameEn: "Plank", category: "CORE", movementPattern: "CORE_BRACE", primaryMuscles: arr(["RECTUS_ABDOMINIS","TRANSVERSE_ABDOMINIS"]), secondaryMuscles: arr(["ANTERIOR_DELTOID","QUADRICEPS"]), equipment: arr(["BODYWEIGHT"]), difficulty: "BEGINNER", sessionRole: "WARMUP", coachingCues: arr(["从头到脚一条直线","收紧臀部和腹部","肩胛骨不塌陷"]), commonErrors: arr(["塌腰","臀部过高","憋气"]) },
    { name: "臀桥", nameEn: "Glute Bridge", category: "STRENGTH", movementPattern: "HINGE", primaryMuscles: arr(["GLUTES"]), secondaryMuscles: arr(["HAMSTRINGS","ERECTOR_SPINAE"]), equipment: arr(["BODYWEIGHT"]), difficulty: "BEGINNER", sessionRole: "WARMUP", coachingCues: arr(["仰卧屈膝","臀部发力上推","顶部夹臀1-2秒","保持核心收紧"]), commonErrors: arr(["用腰代偿","幅度不够","脚跟离地"]) },

    // -- 灵活性/激活动作 --
    { name: "猫牛式", nameEn: "Cat-Cow Stretch", category: "FLEXIBILITY", movementPattern: "MOBILITY", primaryMuscles: arr(["ERECTOR_SPINAE","RECTUS_ABDOMINIS"]), secondaryMuscles: arr(["TRAPEZIUS"]), equipment: arr(["BODYWEIGHT"]), difficulty: "BEGINNER", sessionRole: "WARMUP", coachingCues: arr(["四足跪姿","缓慢弓背塌腰","配合呼吸(吸气塌腰/呼气弓背)","感受脊柱逐节活动"]), commonErrors: arr(["动作太快","呼吸不配合","只动腰不动胸椎"]) },
    { name: "胸椎旋转拉伸", nameEn: "Thoracic Rotation", category: "FLEXIBILITY", movementPattern: "ROTATION", primaryMuscles: arr(["ERECTOR_SPINAE","OBLIQUES"]), secondaryMuscles: arr(["LATISSIMUS_DORSI"]), equipment: arr(["BODYWEIGHT"]), difficulty: "BEGINNER", sessionRole: "WARMUP", coachingCues: arr(["侧躺/四足跪姿","骨盆固定不动","上半身旋转","眼随手动"]), commonErrors: arr(["骨盆跟着转","憋气","强行压"]) },
    { name: "弹力带肩部绕环", nameEn: "Band Shoulder Circle", category: "WARMUP", movementPattern: "MOBILITY", primaryMuscles: arr(["ANTERIOR_DELTOID","MEDIAL_DELTOID","POSTERIOR_DELTOID"]), secondaryMuscles: arr(["ROTATOR_CUFF"]), equipment: arr(["BAND"]), difficulty: "BEGINNER", sessionRole: "WARMUP", coachingCues: arr(["弹力带双手持握","直臂从前向后或从后向前绕环","控制全程不松力","肩关节活动度热身"]), commonErrors: arr(["肘部弯曲","弹力带太松","速度过快"]) },
    { name: "弹力带髋关节激活", nameEn: "Band Hip Activation", category: "WARMUP", movementPattern: "MOBILITY", primaryMuscles: arr(["HIP_ABDUCTORS","GLUTES"]), secondaryMuscles: arr(["HIP_ADDUCTORS"]), equipment: arr(["BAND"]), difficulty: "BEGINNER", sessionRole: "WARMUP", coachingCues: arr(["弹力带套在膝盖上方或脚踝","侧走/前走/后走","膝盖微屈保持半蹲","感受臀部外侧激活"]), commonErrors: arr(["弹力带位置不对","膝盖内扣","上半身摇晃"]) },
    { name: "泡沫轴滚压", nameEn: "Foam Rolling", category: "RECOVERY", movementPattern: "MOBILITY", primaryMuscles: arr(["QUADRICEPS","HAMSTRINGS","CALVES","LATISSIMUS_DORSI"]), equipment: arr(["FOAM_ROLLER"]), difficulty: "BEGINNER", sessionRole: "WARMUP", coachingCues: arr(["缓慢滚压","找到压痛点停留30秒","从远端向近心端","训练前和训练后均可使用"]), commonErrors: arr(["速度太快","直接滚关节骨骼处"]) },

    // -- 轻量激活 --
    { name: "弹力带肩袖外旋", nameEn: "Band External Rotation", category: "STRENGTH", movementPattern: "OTHER", primaryMuscles: arr(["ROTATOR_CUFF","POSTERIOR_DELTOID"]), secondaryMuscles: arr(["RHOMBOIDS"]), equipment: arr(["BAND"]), difficulty: "BEGINNER", sessionRole: "WARMUP", coachingCues: arr(["肘部贴紧身体","前臂外旋","缓慢回程","激活肩袖小肌群"]), commonErrors: arr(["肘部离开身体","耸肩","用大肌群代偿"]) },
    { name: "弹力带面拉激活", nameEn: "Band Face Pull", category: "STRENGTH", movementPattern: "PULL_HORIZONTAL", primaryMuscles: arr(["POSTERIOR_DELTOID","RHOMBOIDS","ROTATOR_CUFF"]), secondaryMuscles: arr(["TRAPEZIUS"]), equipment: arr(["BAND","CABLE"]), difficulty: "BEGINNER", sessionRole: "WARMUP", coachingCues: arr(["弹力带固定于面部高度","手肘高于手腕","拉向面部同时外旋","激活肩后束和肩袖"]), commonErrors: arr(["手肘低于手腕","只用上斜方","身体借力"]) },
    { name: "高脚杯深蹲(轻量)", nameEn: "Goblet Squat (Light)", category: "STRENGTH", movementPattern: "SQUAT", primaryMuscles: arr(["QUADRICEPS","GLUTES"]), secondaryMuscles: arr(["RECTUS_ABDOMINIS"]), equipment: arr(["DUMBBELL","KETTLEBELL"]), difficulty: "BEGINNER", sessionRole: "WARMUP", coachingCues: arr(["轻量哑铃紧贴胸前","控制下蹲深度","训练前激活下肢","1-2组即可"]), commonErrors: arr(["重量过大变成主训练","含胸驼背"]) },

    // -- 神经激活 --
    { name: "跳箱(低箱)", nameEn: "Box Jump (Low)", category: "POWER", movementPattern: "PLYOMETRIC", primaryMuscles: arr(["QUADRICEPS","GLUTES","CALVES"]), secondaryMuscles: arr(["RECTUS_ABDOMINIS"]), equipment: arr(["PLYO_BOX"]), difficulty: "BEGINNER", sessionRole: "WARMUP", coachingCues: arr(["低箱(30-45cm)","爆发性起跳","着地时屈膝缓冲","1-2组轻量激活神经"]), commonErrors: arr(["箱子太高","跳下时直接落地","关节锁死着地"]) },
    { name: "药球下砸", nameEn: "Med Ball Slam", category: "POWER", movementPattern: "PLYOMETRIC", primaryMuscles: arr(["RECTUS_ABDOMINIS","OBLIQUES","LATISSIMUS_DORSI"]), secondaryMuscles: arr(["TRICEPS","QUADRICEPS"]), equipment: arr(["MEDICINE_BALL"]), difficulty: "BEGINNER", sessionRole: "WARMUP", coachingCues: arr(["药球高举过头","核心爆发力下砸","连贯动作","轻量激活中枢神经"]), commonErrors: arr(["只弯腰不用核心","砸完后未准备下一个"]) },

    // -----------------------------------------------
    // 二、主体训练 (MAIN) - 30个
    // -----------------------------------------------
    // -- 下肢蹲类 --
    { name: "杠铃后蹲", nameEn: "Barbell Back Squat", category: "STRENGTH", movementPattern: "SQUAT", primaryMuscles: arr(["QUADRICEPS","GLUTES"]), secondaryMuscles: arr(["HAMSTRINGS","ERECTOR_SPINAE"]), equipment: arr(["BARBELL","SQUAT_RACK"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["杠铃置于斜方肌上","挺胸收腹","下蹲至大腿与地面平行或更深","膝盖朝向脚尖方向","重心均匀分布"]), commonErrors: arr(["膝盖内扣","脚跟抬起","上半身前倾过多"]), isNscaStandard: true },
    { name: "杠铃前蹲", nameEn: "Barbell Front Squat", category: "STRENGTH", movementPattern: "SQUAT", primaryMuscles: arr(["QUADRICEPS","GLUTES"]), secondaryMuscles: arr(["ERECTOR_SPINAE","RECTUS_ABDOMINIS"]), equipment: arr(["BARBELL","SQUAT_RACK"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["杠铃置于锁骨和三角肌前束上","肘部抬高","保持躯干直立","更强调股四头肌"]), commonErrors: arr(["肘部下垂","上半身过度前倾"]), isNscaStandard: true },
    { name: "六角杠硬拉", nameEn: "Trap Bar Deadlift", category: "STRENGTH", movementPattern: "HINGE", primaryMuscles: arr(["GLUTES","QUADRICEPS","HAMSTRINGS"]), secondaryMuscles: arr(["TRAPEZIUS","FOREARMS"]), equipment: arr(["OTHER"]), difficulty: "BEGINNER", sessionRole: "MAIN", coachingCues: arr(["双手握住手柄","保持脊柱中立位","强调腿部发力","比传统硬拉对下背更友好"]), commonErrors: arr(["圆背","膝盖过早锁定"]), isNscaStandard: true },
    { name: "传统硬拉", nameEn: "Conventional Deadlift", category: "STRENGTH", movementPattern: "HINGE", primaryMuscles: arr(["GLUTES","HAMSTRINGS","ERECTOR_SPINAE"]), secondaryMuscles: arr(["TRAPEZIUS","FOREARMS","LATISSIMUS_DORSI"]), equipment: arr(["BARBELL"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["杠铃贴近小腿","挺胸收腹","髋膝同时伸展","锁定时不后仰"]), commonErrors: arr(["圆背","杠铃远离身体","锁定过度后仰"]), isNscaStandard: true },

    // -- 上肢推类 --
    { name: "杠铃卧推", nameEn: "Barbell Bench Press", category: "STRENGTH", movementPattern: "PUSH_HORIZONTAL", primaryMuscles: arr(["PECTORALIS","ANTERIOR_DELTOID","TRICEPS"]), secondaryMuscles: arr(["SERRATUS_ANTERIOR"]), equipment: arr(["BARBELL","BENCH"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["肩胛骨收紧","杠铃下降至胸骨处","推起时爆发力","五点接触"]), commonErrors: arr(["肩膀前伸","杠铃弹胸","臀部抬起"]), isNscaStandard: true },
    { name: "哑铃卧推", nameEn: "Dumbbell Bench Press", category: "STRENGTH", movementPattern: "PUSH_HORIZONTAL", primaryMuscles: arr(["PECTORALIS","ANTERIOR_DELTOID","TRICEPS"]), secondaryMuscles: arr(["SERRATUS_ANTERIOR"]), equipment: arr(["DUMBBELL","BENCH"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["更大运动范围","改善两侧力量平衡","底部轻微拉伸"]), commonErrors: arr(["哑铃碰撞","下降幅度过大"]), isNscaStandard: true },
    { name: "实力推举", nameEn: "Standing Overhead Press", category: "STRENGTH", movementPattern: "PUSH_VERTICAL", primaryMuscles: arr(["ANTERIOR_DELTOID","MEDIAL_DELTOID","TRICEPS"]), secondaryMuscles: arr(["TRAPEZIUS","RECTUS_ABDOMINIS"]), equipment: arr(["BARBELL"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["核心收紧","肘部在杠铃前下方","头部微后让出杠铃路径"]), commonErrors: arr(["腰部过度弯曲","杠铃绕远"]), isNscaStandard: true },

    // -- 上肢拉类 --
    { name: "杠铃划船", nameEn: "Barbell Bent-Over Row", category: "STRENGTH", movementPattern: "PULL_HORIZONTAL", primaryMuscles: arr(["LATISSIMUS_DORSI","TRAPEZIUS","RHOMBOIDS"]), secondaryMuscles: arr(["BICEPS","POSTERIOR_DELTOID","ERECTOR_SPINAE"]), equipment: arr(["BARBELL"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["保持俯身角度不变","杠铃拉向腹部","肘部靠近身体","背部发力而非手臂"]), commonErrors: arr(["惯性甩","上半身起伏过大"]), isNscaStandard: true },
    { name: "负重引体向上", nameEn: "Weighted Pull-Up", category: "STRENGTH", movementPattern: "PULL_VERTICAL", primaryMuscles: arr(["LATISSIMUS_DORSI","BICEPS"]), secondaryMuscles: arr(["TRAPEZIUS","RHOMBOIDS"]), equipment: arr(["PULL_UP_BAR"]), difficulty: "ADVANCED", sessionRole: "MAIN", coachingCues: arr(["下巴过杠","控制下放","避免借力摆动","可负重腰带加重"]), commonErrors: arr(["摆动借力","半程动作"]), isNscaStandard: true },
    { name: "高位下拉", nameEn: "Lat Pulldown", category: "STRENGTH", movementPattern: "PULL_VERTICAL", primaryMuscles: arr(["LATISSIMUS_DORSI"]), secondaryMuscles: arr(["BICEPS","RHOMBOIDS"]), equipment: arr(["CABLE"]), difficulty: "BEGINNER", sessionRole: "MAIN", coachingCues: arr(["肩胛骨下沉","想象用肘部下拉","控制收缩","身体不后仰"]), commonErrors: arr(["耸肩","身体后仰过多"]), isNscaStandard: true },

    // -- 爆发力训练 --
    { name: "膝上高翻", nameEn: "Hang Power Clean", category: "POWER", movementPattern: "PLYOMETRIC", primaryMuscles: arr(["GLUTES","QUADRICEPS","TRAPEZIUS"]), secondaryMuscles: arr(["HAMSTRINGS","ANTERIOR_DELTOID","FOREARMS"]), equipment: arr(["BARBELL"]), difficulty: "ADVANCED", sessionRole: "MAIN", coachingCues: arr(["杠铃从膝上发力","三关节爆发性伸展","快速翻腕接铃","动作连贯"]), commonErrors: arr(["用手臂拉","第二拉不充分","接铃缓冲不足"]), isNscaStandard: true },
    { name: "杠铃高拉", nameEn: "Barbell Clean High Pull", category: "POWER", movementPattern: "PLYOMETRIC", primaryMuscles: arr(["GLUTES","QUADRICEPS","TRAPEZIUS"]), secondaryMuscles: arr(["HAMSTRINGS","ANTERIOR_DELTOID","FOREARMS"]), equipment: arr(["BARBELL"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["从膝上或地面启动","三关节爆发性伸展","肘部引领向上拉至胸前","不翻腕接铃","专注爆发力发力阶段"]), commonErrors: arr(["用手臂拉","髋膝伸展不充分","节奏脱节"]), isNscaStandard: true },
    { name: "杠铃高抓", nameEn: "Barbell Power Snatch", category: "POWER", movementPattern: "PLYOMETRIC", primaryMuscles: arr(["GLUTES","QUADRICEPS","TRAPEZIUS","ANTERIOR_DELTOID"]), secondaryMuscles: arr(["HAMSTRINGS","FOREARMS","RECTUS_ABDOMINIS"]), equipment: arr(["BARBELL"]), difficulty: "ADVANCED", sessionRole: "MAIN", coachingCues: arr(["宽握距","从膝上或地面启动","三关节爆发性伸展","快速下拉身体接铃","过头支撑锁定"]), commonErrors: arr(["握距太窄","过早拉臂","接铃不稳","髋膝伸展不充分"]), isNscaStandard: true },
    { name: "借力推举", nameEn: "Push Press", category: "POWER", movementPattern: "PUSH_VERTICAL", primaryMuscles: arr(["ANTERIOR_DELTOID","TRICEPS","QUADRICEPS"]), secondaryMuscles: arr(["GLUTES","TRAPEZIUS"]), equipment: arr(["BARBELL"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["微蹲后爆发性伸展","利用下肢力量辅助推举","连贯动作"]), commonErrors: arr(["蹲太深","上下肢脱节"]), isNscaStandard: true },
    { name: "壶铃摆荡", nameEn: "Kettlebell Swing", category: "POWER", movementPattern: "HINGE", primaryMuscles: arr(["GLUTES","HAMSTRINGS"]), secondaryMuscles: arr(["ERECTOR_SPINAE","FOREARMS"]), equipment: arr(["KETTLEBELL"]), difficulty: "BEGINNER", sessionRole: "MAIN", coachingCues: arr(["髋部爆发力推送","手臂只是连接","像用髋部把壶铃推出去"]), commonErrors: arr(["用手臂举","蹲姿错误(应用铰链)"]), isNscaStandard: true },
    { name: "跳箱", nameEn: "Box Jump", category: "POWER", movementPattern: "PLYOMETRIC", primaryMuscles: arr(["QUADRICEPS","GLUTES","CALVES"]), secondaryMuscles: arr(["RECTUS_ABDOMINIS","HIP_FLEXORS"]), equipment: arr(["PLYO_BOX"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["爆发性起跳","膝盖向胸收","轻盈着陆","着地时屈膝缓冲"]), commonErrors: arr(["着地关节锁死","从箱子上跳下"]), isNscaStandard: true },
    { name: "哑铃抓举(单臂)", nameEn: "One-Arm Dumbbell Snatch", category: "POWER", movementPattern: "PLYOMETRIC", primaryMuscles: arr(["GLUTES","QUADRICEPS","ANTERIOR_DELTOID"]), secondaryMuscles: arr(["TRAPEZIUS","TRICEPS"]), equipment: arr(["DUMBBELL"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["单臂爆发力","连贯动作一气呵成","控制下落","对握力和全身协调要求高"]), commonErrors: arr(["圆弧路径偏心","膝盖内扣"]), isNscaStandard: true },
    { name: "药球旋转侧抛", nameEn: "Rotational Med Ball Toss", category: "POWER", movementPattern: "ROTATION", primaryMuscles: arr(["OBLIQUES","RECTUS_ABDOMINIS","GLUTES"]), secondaryMuscles: arr(["ANTERIOR_DELTOID","LATISSIMUS_DORSI"]), equipment: arr(["MEDICINE_BALL"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["利用髋部和核心旋转发力","手臂只是传导力量","站姿/跪姿均可","模拟旋转爆发力(出拳/挥拍/投掷)"]), commonErrors: arr(["只用手臂发力","核心不参与旋转"]), isNscaStandard: true },

    // -- 单侧/功能训练 --
    { name: "保加利亚分腿蹲", nameEn: "Bulgarian Split Squat", category: "STRENGTH", movementPattern: "SQUAT", primaryMuscles: arr(["QUADRICEPS","GLUTES"]), secondaryMuscles: arr(["HAMSTRINGS","CALVES"]), equipment: arr(["DUMBBELL","BENCH"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["后脚置于凳上","前膝不要超过脚尖","保持躯干直立","改善单侧力量和平衡"]), commonErrors: arr(["前膝过度前移","骨盆倾斜"]), isNscaStandard: true },
    { name: "单腿罗马尼亚硬拉", nameEn: "Single Leg RDL", category: "STRENGTH", movementPattern: "HINGE", primaryMuscles: arr(["HAMSTRINGS","GLUTES"]), secondaryMuscles: arr(["ERECTOR_SPINAE","HIP_ABDUCTORS"]), equipment: arr(["DUMBBELL","KETTLEBELL"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["支撑腿微屈","骨盆不旋转","自由腿向后延伸","加强单侧稳定和腘绳肌"]), commonErrors: arr(["骨盆旋转","腰椎弯曲"]), isNscaStandard: true },
    { name: "农夫行走", nameEn: "Farmer's Walk", category: "STRENGTH", movementPattern: "CARRY", primaryMuscles: arr(["FOREARMS","TRAPEZIUS","RECTUS_ABDOMINIS"]), secondaryMuscles: arr(["GLUTES","OBLIQUES"]), equipment: arr(["DUMBBELL","KETTLEBELL"]), difficulty: "BEGINNER", sessionRole: "MAIN", coachingCues: arr(["大重量双侧重物行走","保持姿态正直","核心绷紧","强化握力+全身稳定"]), commonErrors: arr(["肩膀歪斜","步幅太小","重量太轻"]), isNscaStandard: true },
    { name: "臀推", nameEn: "Hip Thrust", category: "STRENGTH", movementPattern: "HINGE", primaryMuscles: arr(["GLUTES"]), secondaryMuscles: arr(["HAMSTRINGS","ERECTOR_SPINAE"]), equipment: arr(["BARBELL","BENCH"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["肩胛骨靠凳","杠铃置于髋部","臀部爆发力上推","顶部夹臀"]), commonErrors: arr(["过度拱腰","头部过度后仰","幅度不够"]), isNscaStandard: true },

    // -- 器械训练 --
    { name: "腿举(倒蹬机)", nameEn: "Leg Press", category: "STRENGTH", movementPattern: "SQUAT", primaryMuscles: arr(["QUADRICEPS","GLUTES"]), secondaryMuscles: arr(["HAMSTRINGS","CALVES"]), equipment: arr(["OTHER"]), difficulty: "BEGINNER", sessionRole: "MAIN", coachingCues: arr(["背部贴紧靠垫","膝盖不要锁死","控制下放深度","适合大重量下肢刺激"]), commonErrors: arr(["膝盖锁死","下放太深导致骨盆翻转","手扶膝盖"]) },
    { name: "坐姿绳索划船", nameEn: "Seated Cable Row", category: "STRENGTH", movementPattern: "PULL_HORIZONTAL", primaryMuscles: arr(["LATISSIMUS_DORSI","RHOMBOIDS"]), secondaryMuscles: arr(["BICEPS","POSTERIOR_DELTOID"]), equipment: arr(["CABLE"]), difficulty: "BEGINNER", sessionRole: "MAIN", coachingCues: arr(["保持背部直立","肘部向后拉","顶部夹紧肩胛","控制回程"]), commonErrors: arr(["身体前后晃动","耸肩","只用二头肌"]) },
    { name: "哑铃上斜卧推", nameEn: "Incline Dumbbell Press", category: "STRENGTH", movementPattern: "PUSH_HORIZONTAL", primaryMuscles: arr(["PECTORALIS","ANTERIOR_DELTOID"]), secondaryMuscles: arr(["TRICEPS"]), equipment: arr(["DUMBBELL","BENCH"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["凳角30-45度","强调上胸","下落至胸上部","双侧稳定"]), commonErrors: arr(["角度太陡变成肩推","哑铃碰撞"]) },
    { name: "罗马尼亚硬拉", nameEn: "Romanian Deadlift", category: "STRENGTH", movementPattern: "HINGE", primaryMuscles: arr(["HAMSTRINGS","GLUTES"]), secondaryMuscles: arr(["ERECTOR_SPINAE"]), equipment: arr(["BARBELL","DUMBBELL"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["膝关节微屈","只通过髋关节后移下放","背部保持平直","感受腘绳肌拉伸"]), commonErrors: arr(["膝盖弯曲过多","圆背","杠铃远离身体"]) },

    // -- 爆发力代谢 --
    { name: "战绳", nameEn: "Battle Ropes", category: "POWER", movementPattern: "OTHER", primaryMuscles: arr(["ANTERIOR_DELTOID","FOREARMS","RECTUS_ABDOMINIS"]), secondaryMuscles: arr(["QUADRICEPS","TRICEPS"]), equipment: arr(["OTHER"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["多种波浪模式","保持半蹲姿势","核心绷紧","间歇/持续模式","提升无氧耐力"]), commonErrors: arr(["站姿不正确","只用上肢","节奏混乱"]) },
    { name: "推雪橇", nameEn: "Sled Push", category: "POWER", movementPattern: "GAIT", primaryMuscles: arr(["QUADRICEPS","GLUTES","CALVES"]), secondaryMuscles: arr(["RECTUS_ABDOMINIS"]), equipment: arr(["SLED"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["保持前倾角度","积极蹬地","加速到全速","适合冲刺/爆发力训练"]), commonErrors: arr(["身体太直立","步幅太短"]) },

    // -----------------------------------------------
    // 三、辅助训练 (ACCESSORY) - 25个
    // -----------------------------------------------
    // -- 上肢辅助 --
    { name: "弹力带面拉", nameEn: "Band Face Pull", category: "STRENGTH", movementPattern: "PULL_HORIZONTAL", primaryMuscles: arr(["POSTERIOR_DELTOID","RHOMBOIDS","ROTATOR_CUFF"]), secondaryMuscles: arr(["TRAPEZIUS"]), equipment: arr(["BAND","CABLE"]), difficulty: "BEGINNER", sessionRole: "ACCESSORY", coachingCues: arr(["弹力带固定于面部高度","手肘高于手腕","拉向面部同时外旋","改善肩部健康和体态"]), commonErrors: arr(["手肘低于手腕","用上斜方代偿"]) },
    { name: "单臂哑铃划船", nameEn: "One-Arm Dumbbell Row", category: "STRENGTH", movementPattern: "PULL_HORIZONTAL", primaryMuscles: arr(["LATISSIMUS_DORSI","RHOMBOIDS"]), secondaryMuscles: arr(["BICEPS","POSTERIOR_DELTOID"]), equipment: arr(["DUMBBELL","BENCH"]), difficulty: "BEGINNER", sessionRole: "ACCESSORY", coachingCues: arr(["单膝跪凳支撑","背部平坦","肘部向后上方拉","顶部顶峰收缩"]), commonErrors: arr(["旋转躯干代偿","肩部耸肩"]), isNscaStandard: true },
    { name: "哑铃侧平举", nameEn: "Lateral Raise", category: "STRENGTH", movementPattern: "OTHER", primaryMuscles: arr(["MEDIAL_DELTOID"]), secondaryMuscles: arr(["ANTERIOR_DELTOID","TRAPEZIUS"]), equipment: arr(["DUMBBELL"]), difficulty: "BEGINNER", sessionRole: "ACCESSORY", coachingCues: arr(["微屈肘","控制上升(不要甩)","顶部暂停1秒","轻重量多次数"]), commonErrors: arr(["用惯性甩","耸肩","重量过大"]) },
    { name: "哑铃俯身飞鸟", nameEn: "Bent-Over Reverse Fly", category: "STRENGTH", movementPattern: "PULL_HORIZONTAL", primaryMuscles: arr(["POSTERIOR_DELTOID","RHOMBOIDS"]), secondaryMuscles: arr(["TRAPEZIUS"]), equipment: arr(["DUMBBELL"]), difficulty: "BEGINNER", sessionRole: "ACCESSORY", coachingCues: arr(["俯身至躯干平行地面","肘部微屈","向后上方打开","控制重量"]), commonErrors: arr(["借力甩","耸肩","俯身不够"]) },
    { name: "杠铃弯举", nameEn: "Barbell Curl", category: "STRENGTH", movementPattern: "OTHER", primaryMuscles: arr(["BICEPS"]), secondaryMuscles: arr(["FOREARMS"]), equipment: arr(["BARBELL"]), difficulty: "BEGINNER", sessionRole: "ACCESSORY", coachingCues: arr(["肘部贴紧身体","控制全程","不要借力晃动","挤压顶峰"]), commonErrors: arr(["借力甩","肘部前移","半程动作"]) },
    { name: "绳索下压(肱三头肌)", nameEn: "Cable Tricep Pushdown", category: "STRENGTH", movementPattern: "OTHER", primaryMuscles: arr(["TRICEPS"]), secondaryMuscles: arr(["FOREARMS"]), equipment: arr(["CABLE"]), difficulty: "BEGINNER", sessionRole: "ACCESSORY", coachingCues: arr(["肘部固定于身体两侧","只动肘关节","到底时完全伸直","顶峰收缩"]), commonErrors: arr(["肘部前后移动","身体借力","握距太宽"]) },

    // -- 下肢辅助 --
    { name: "北欧腘绳肌弯举", nameEn: "Nordic Hamstring Curl", category: "STRENGTH", movementPattern: "HINGE", primaryMuscles: arr(["HAMSTRINGS"]), secondaryMuscles: arr(["GLUTES","ERECTOR_SPINAE"]), equipment: arr(["BODYWEIGHT","OTHER"]), difficulty: "ADVANCED", sessionRole: "ACCESSORY", coachingCues: arr(["双脚固定(同伴压脚或器械)","缓慢下放控制离心","用腘绳肌发力","腘绳肌损伤预防必练"]), commonErrors: arr(["下放过快失去控制","髋部先弯曲"]), isNscaStandard: true },
    { name: "腿弯举(器械)", nameEn: "Leg Curl Machine", category: "STRENGTH", movementPattern: "OTHER", primaryMuscles: arr(["HAMSTRINGS"]), secondaryMuscles: arr(["CALVES"]), equipment: arr(["OTHER"]), difficulty: "BEGINNER", sessionRole: "ACCESSORY", coachingCues: arr(["调整器械使膝盖对齐转轴","控制离心","不借力","侧重腘绳肌孤立训练"]), commonErrors: arr(["借力甩","动作太快","活动范围不足"]) },
    { name: "腿伸展(器械)", nameEn: "Leg Extension Machine", category: "STRENGTH", movementPattern: "OTHER", primaryMuscles: arr(["QUADRICEPS"]), secondaryMuscles: arr([]), equipment: arr(["OTHER"]), difficulty: "BEGINNER", sessionRole: "ACCESSORY", coachingCues: arr(["调整靠背使膝盖对齐转轴","控制离心下放","顶峰收缩","孤立股四头肌"]), commonErrors: arr(["借力","膝盖过度伸展锁死"]) },
    { name: "提踵", nameEn: "Calf Raise", category: "STRENGTH", movementPattern: "OTHER", primaryMuscles: arr(["CALVES"]), secondaryMuscles: arr([]), equipment: arr(["BODYWEIGHT","DUMBBELL","BARBELL"]), difficulty: "BEGINNER", sessionRole: "ACCESSORY", coachingCues: arr(["站姿/坐姿均可","完整活动范围(底→顶→底)","控制节奏","15-25次/组"]), commonErrors: arr(["半程动作","太快","膝盖借力"]) },
    { name: "哥本哈根内收训练", nameEn: "Copenhagen Adduction", category: "STRENGTH", movementPattern: "CORE_BRACE", primaryMuscles: arr(["HIP_ADDUCTORS"]), secondaryMuscles: arr(["OBLIQUES","RECTUS_ABDOMINIS"]), equipment: arr(["BENCH","BODYWEIGHT"]), difficulty: "INTERMEDIATE", sessionRole: "ACCESSORY", coachingCues: arr(["上腿放凳子上","核心+内收肌发力保持身体直线","预防腹股沟损伤"]), commonErrors: arr(["塌腰","膝盖代替髋发力"]) },
    { name: "弹力带蚌式", nameEn: "Band Clamshell", category: "STRENGTH", movementPattern: "OTHER", primaryMuscles: arr(["HIP_ABDUCTORS","GLUTES"]), secondaryMuscles: arr([]), equipment: arr(["BAND"]), difficulty: "BEGINNER", sessionRole: "ACCESSORY", coachingCues: arr(["侧躺弹力带套膝上","脚跟并拢","膝盖像蚌壳打开","控制回程","激活臀中肌"]), commonErrors: arr(["骨盆跟着旋转","太快","幅度不够"]) },

    // -- 核心辅助 --
    { name: "帕罗夫抗旋推", nameEn: "Pallof Press", category: "CORE", movementPattern: "ROTATION", primaryMuscles: arr(["RECTUS_ABDOMINIS","OBLIQUES","TRANSVERSE_ABDOMINIS"]), secondaryMuscles: arr(["GLUTES"]), equipment: arr(["CABLE","BAND"]), difficulty: "BEGINNER", sessionRole: "ACCESSORY", coachingCues: arr(["对抗拉力不旋转","核心等长收缩","向前推/过顶推变式均可"]), commonErrors: arr(["身体旋转了","肩膀耸起"]), isNscaStandard: true },
    { name: "悬垂举腿", nameEn: "Hanging Leg Raise", category: "CORE", movementPattern: "CORE_BRACE", primaryMuscles: arr(["RECTUS_ABDOMINIS","HIP_FLEXORS"]), secondaryMuscles: arr(["OBLIQUES","FOREARMS"]), equipment: arr(["PULL_UP_BAR"]), difficulty: "INTERMEDIATE", sessionRole: "ACCESSORY", coachingCues: arr(["避免摆动","控制举腿","可直腿或屈膝","膝盖触胸为佳"]), commonErrors: arr(["摆动借力","举腿高度不足"]), isNscaStandard: true },
    { name: "绳索旋转砍", nameEn: "Cable Woodchop", category: "CORE", movementPattern: "ROTATION", primaryMuscles: arr(["OBLIQUES","RECTUS_ABDOMINIS"]), secondaryMuscles: arr(["GLUTES","LATISSIMUS_DORSI"]), equipment: arr(["CABLE"]), difficulty: "INTERMEDIATE", sessionRole: "ACCESSORY", coachingCues: arr(["高低位互换","利用核心旋转发力","模拟旋转运动专项","控制全程"]), commonErrors: arr(["用腰椎弯曲代替旋转","只动手臂"]), isNscaStandard: true },
    { name: "单侧农夫行走", nameEn: "Suitcase Carry", category: "CORE", movementPattern: "CARRY", primaryMuscles: arr(["OBLIQUES","TRANSVERSE_ABDOMINIS","FOREARMS"]), secondaryMuscles: arr(["GLUTES","TRAPEZIUS"]), equipment: arr(["DUMBBELL","KETTLEBELL"]), difficulty: "INTERMEDIATE", sessionRole: "ACCESSORY", coachingCues: arr(["单侧重物","对抗侧屈保持躯干直立","核心抗侧屈训练"]), commonErrors: arr(["身体向负重侧倾斜","耸肩"]), isNscaStandard: true },

    // -- 颈部(格斗专项辅助) --
    { name: "弹力带颈部屈伸", nameEn: "Band Neck Flexion/Extension", category: "STRENGTH", movementPattern: "OTHER", primaryMuscles: arr(["NECK"]), secondaryMuscles: arr(["TRAPEZIUS"]), equipment: arr(["BAND"]), difficulty: "BEGINNER", sessionRole: "ACCESSORY", coachingCues: arr(["弹力带固定于头部高度","分别做屈/伸/侧屈/旋转","缓慢控制","颈部防击打/防鞭甩"]), commonErrors: arr(["动作太快","阻力过大","憋气"]) },

    // -- 握力/前臂辅助 --
    { name: "杠铃片捏握", nameEn: "Plate Pinch", category: "STRENGTH", movementPattern: "OTHER", primaryMuscles: arr(["FOREARMS"]), secondaryMuscles: arr(["BICEPS"]), equipment: arr(["OTHER"]), difficulty: "BEGINNER", sessionRole: "ACCESSORY", coachingCues: arr(["拇指和四指捏住杠铃片边缘","保持时间或行走","强化握力"]), commonErrors: arr(["手指弯曲握着而非捏着","重量太大"]) },
    { name: "壶铃底朝上持握", nameEn: "Bottoms-Up KB Hold", category: "STRENGTH", movementPattern: "OTHER", primaryMuscles: arr(["FOREARMS","BICEPS"]), secondaryMuscles: arr(["ANTERIOR_DELTOID","RECTUS_ABDOMINIS"]), equipment: arr(["KETTLEBELL"]), difficulty: "INTERMEDIATE", sessionRole: "ACCESSORY", coachingCues: arr(["壶铃底部朝上","手腕保持中立位","需要额外稳定力量控制"]), commonErrors: arr(["手腕过度伸展","核心松弛"]) },

    // -- 肩袖/肩部健康 --
    { name: "哑铃肩外旋", nameEn: "DB External Rotation", category: "STRENGTH", movementPattern: "OTHER", primaryMuscles: arr(["ROTATOR_CUFF","POSTERIOR_DELTOID"]), secondaryMuscles: arr([]), equipment: arr(["DUMBBELL"]), difficulty: "BEGINNER", sessionRole: "ACCESSORY", coachingCues: arr(["侧躺/肘部贴紧身体","前臂外旋","轻重量(2-5kg)","高次数(12-15)","肩袖保养"]), commonErrors: arr(["肘离开身体","重量太大","借力甩"]) },

    // -- 恢复拉伸 --
    { name: "鸽式拉伸", nameEn: "Pigeon Stretch", category: "FLEXIBILITY", movementPattern: "MOBILITY", primaryMuscles: arr(["GLUTES","HIP_FLEXORS"]), secondaryMuscles: arr(["HIP_ABDUCTORS"]), equipment: arr(["BODYWEIGHT"]), difficulty: "BEGINNER", sessionRole: "ACCESSORY", coachingCues: arr(["前腿屈膝外展","后腿伸直","保持骨盆正面朝前","保持30-60秒"]), commonErrors: arr(["前腿角度不够","骨盆歪斜","强行下压"]) },
    { name: "四字拉伸", nameEn: "Figure-4 Stretch", category: "FLEXIBILITY", movementPattern: "MOBILITY", primaryMuscles: arr(["GLUTES","HIP_ABDUCTORS"]), secondaryMuscles: arr(["HAMSTRINGS"]), equipment: arr(["BODYWEIGHT"]), difficulty: "BEGINNER", sessionRole: "ACCESSORY", coachingCues: arr(["躺姿/坐姿均可","一腿脚踝搭在另一腿膝盖上","向胸部方向拉","保持30秒"]), commonErrors: arr(["拉伸腿用力对抗","姿势错误"]) },
    { name: "婴儿式拉伸", nameEn: "Child's Pose", category: "FLEXIBILITY", movementPattern: "MOBILITY", primaryMuscles: arr(["LATISSIMUS_DORSI","ERECTOR_SPINAE"]), secondaryMuscles: arr(["GLUTES"]), equipment: arr(["BODYWEIGHT"]), difficulty: "BEGINNER", sessionRole: "ACCESSORY", coachingCues: arr(["跪姿臀部坐在脚跟上","双臂向前伸展","额头触地","保持15-30秒放松"]), commonErrors: arr(["臀部没坐在脚跟上","憋气","强行压"]) },

    // === 补回之前缺失的动作 ===

    // -- 热身激活补充 --
    { name: "弹力带髋屈肌激活", nameEn: "Band Hip Flexor Activation", category: "WARMUP", movementPattern: "GAIT", primaryMuscles: arr(["HIP_FLEXORS","QUADRICEPS"]), secondaryMuscles: arr(["RECTUS_ABDOMINIS"]), equipment: arr(["BAND"]), difficulty: "BEGINNER", sessionRole: "WARMUP", coachingCues: arr(["弹力带套在脚踝","爆发性提膝","模拟冲刺/膝击动作","轻量神经激活"]), commonErrors: arr(["身体后仰","动作幅度不足"]) },

    // -- 主体训练补充 --
    { name: "爆发力俯卧撑", nameEn: "Plyometric Push-Up", category: "POWER", movementPattern: "PUSH_HORIZONTAL", primaryMuscles: arr(["PECTORALIS","TRICEPS","ANTERIOR_DELTOID"]), secondaryMuscles: arr(["RECTUS_ABDOMINIS"]), equipment: arr(["BODYWEIGHT"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["快速推离地面","手掌离地","落地时缓冲","上肢爆发力训练"]), commonErrors: arr(["落地关节锁死","核心松弛"]) },
    { name: "单臂哑铃借力推举", nameEn: "One-Arm DB Push Press", category: "POWER", movementPattern: "PUSH_VERTICAL", primaryMuscles: arr(["ANTERIOR_DELTOID","TRICEPS","QUADRICEPS"]), secondaryMuscles: arr(["TRAPEZIUS","RECTUS_ABDOMINIS"]), equipment: arr(["DUMBBELL"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["单臂使用较重哑铃","微蹲后爆发性推举","下肢+上肢协调发力"]), commonErrors: arr(["核心不稳导致侧弯","蹲太深"]) },
    { name: "药球过顶抛", nameEn: "Overhead Med Ball Throw", category: "POWER", movementPattern: "PUSH_VERTICAL", primaryMuscles: arr(["ANTERIOR_DELTOID","TRICEPS","QUADRICEPS"]), secondaryMuscles: arr(["GLUTES","RECTUS_ABDOMINIS"]), equipment: arr(["MEDICINE_BALL"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["下蹲蓄力后全身爆发性伸展","将药球抛向最高点","发展全身爆发力"]), commonErrors: arr(["只用手臂","上下肢不同步"]) },
    { name: "深度跳", nameEn: "Depth Jump", category: "POWER", movementPattern: "PLYOMETRIC", primaryMuscles: arr(["QUADRICEPS","GLUTES","CALVES"]), secondaryMuscles: arr(["RECTUS_ABDOMINIS"]), equipment: arr(["PLYO_BOX"]), difficulty: "ADVANCED", sessionRole: "MAIN", coachingCues: arr(["从箱子迈下(不跳)","触地后立即爆发性跳跃","减少触地时间","拉长-缩短周期高级训练"]), commonErrors: arr(["从箱子上跳下","触地时间过长","箱子过高"]) },
    { name: "地雷管旋转推", nameEn: "Landmine Rotation Press", category: "POWER", movementPattern: "ROTATION", primaryMuscles: arr(["OBLIQUES","ANTERIOR_DELTOID","RECTUS_ABDOMINIS"]), secondaryMuscles: arr(["TRICEPS","GLUTES"]), equipment: arr(["BARBELL","LANDMINE"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["双脚朝前不转","上半身旋转推","核心控制回程","发展旋转爆发力"]), commonErrors: arr(["脚也跟着转","塌腰"]) },
    { name: "毛巾引体向上", nameEn: "Towel Pull-Up", category: "STRENGTH", movementPattern: "PULL_VERTICAL", primaryMuscles: arr(["LATISSIMUS_DORSI","FOREARMS","BICEPS"]), secondaryMuscles: arr(["TRAPEZIUS"]), equipment: arr(["PULL_UP_BAR","OTHER"]), difficulty: "ADVANCED", sessionRole: "MAIN", coachingCues: arr(["毛巾挂在杠上","紧握毛巾做引体","强化握力+背部力量","模拟道服抓握"]), commonErrors: arr(["握不住毛巾","摆动借力"]) },
    { name: "六角杠跳蹲", nameEn: "Trap Bar Jump Squat", category: "POWER", movementPattern: "SQUAT", primaryMuscles: arr(["QUADRICEPS","GLUTES","CALVES"]), secondaryMuscles: arr(["RECTUS_ABDOMINIS"]), equipment: arr(["OTHER"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["轻中负重","爆发性起跳","着陆时屈膝缓冲","强化垂直弹跳"]), commonErrors: arr(["负重过重","落地关节锁死"]) },
    { name: "抗阻带冲刺", nameEn: "Resisted Sprint", category: "SPEED", movementPattern: "GAIT", primaryMuscles: arr(["QUADRICEPS","GLUTES","HAMSTRINGS","CALVES"]), secondaryMuscles: arr(["HIP_FLEXORS"]), equipment: arr(["BAND"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["弹力带固定于腰间","对抗阻力加速","强化启动加速能力"]), commonErrors: arr(["弹力带回弹失去平衡"]) },
    { name: "滑冰者蹲", nameEn: "Skater Squat", category: "STRENGTH", movementPattern: "SQUAT", primaryMuscles: arr(["QUADRICEPS","GLUTES","HIP_ABDUCTORS"]), secondaryMuscles: arr(["CALVES","RECTUS_ABDOMINIS"]), equipment: arr(["BODYWEIGHT","DUMBBELL"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["单腿下蹲","自由腿向后交叉","强调额状面力量","改善侧向变向能力"]), commonErrors: arr(["膝盖内扣","骨盆旋转"]) },
    { name: "小障碍栏跳跃", nameEn: "Hurdle Hop", category: "POWER", movementPattern: "PLYOMETRIC", primaryMuscles: arr(["CALVES","QUADRICEPS","GLUTES"]), secondaryMuscles: arr(["RECTUS_ABDOMINIS"]), equipment: arr(["HURDLES"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["连续跳跃过栏","最短触地时间","利用踝关节刚性","快速伸缩复合训练"]), commonErrors: arr(["着地时间太长","膝盖过度弯曲"]) },
    { name: "壶铃抓举间歇", nameEn: "KB Snatch Intervals", category: "POWER", movementPattern: "PLYOMETRIC", primaryMuscles: arr(["GLUTES","HAMSTRINGS","ANTERIOR_DELTOID"]), secondaryMuscles: arr(["FOREARMS","TRAPEZIUS"]), equipment: arr(["KETTLEBELL"]), difficulty: "ADVANCED", sessionRole: "MAIN", coachingCues: arr(["单臂抓举","设定间歇时间(如30s on/30s off)","模拟回合制","高强度无氧训练"]), commonErrors: arr(["疲劳时动作变形","手腕翻转过猛"]) },

    // -- 辅助训练补充 --
    { name: "弹力带水平拉", nameEn: "Band Row", category: "STRENGTH", movementPattern: "PULL_HORIZONTAL", primaryMuscles: arr(["LATISSIMUS_DORSI","RHOMBOIDS"]), secondaryMuscles: arr(["POSTERIOR_DELTOID","BICEPS"]), equipment: arr(["BAND"]), difficulty: "BEGINNER", sessionRole: "ACCESSORY", coachingCues: arr(["保持身体稳定","控制回程","适合热身或轻量辅助训练"]), commonErrors: arr(["身体后仰代偿","弹力带太松"]) },
    { name: "颈桥", nameEn: "Wrestler's Bridge", category: "STRENGTH", movementPattern: "OTHER", primaryMuscles: arr(["NECK","ERECTOR_SPINAE"]), secondaryMuscles: arr(["GLUTES","HAMSTRINGS"]), equipment: arr(["BODYWEIGHT"]), difficulty: "ADVANCED", sessionRole: "ACCESSORY", coachingCues: arr(["头顶着地","身体成拱形","前后左右滚动","摔跤/柔术基础训练","初学者先练等长"]), commonErrors: arr(["过度压缩颈椎","颈部力量不足时不要蛮做"]) },
    { name: "臀桥内收挤压", nameEn: "Bridge Adductor Squeeze", category: "CORE", movementPattern: "HINGE", primaryMuscles: arr(["GLUTES","HIP_ADDUCTORS"]), secondaryMuscles: arr(["HAMSTRINGS","RECTUS_ABDOMINIS"]), equipment: arr(["MEDICINE_BALL","BODYWEIGHT"]), difficulty: "BEGINNER", sessionRole: "ACCESSORY", coachingCues: arr(["臀桥同时双腿夹紧药球或泡沫轴","强化内收肌和臀大肌协同","柔术/摔跤骑乘位和防守基础"]), commonErrors: arr(["只是挺髋","没有主动夹"]) },
    { name: "土耳其起立", nameEn: "Turkish Get-Up", category: "STRENGTH", movementPattern: "OTHER", primaryMuscles: arr(["ANTERIOR_DELTOID","GLUTES","RECTUS_ABDOMINIS"]), secondaryMuscles: arr(["TRICEPS","OBLIQUES","HIP_FLEXORS"]), equipment: arr(["KETTLEBELL"]), difficulty: "ADVANCED", sessionRole: "ACCESSORY", coachingCues: arr(["壶铃举过头顶","从地面到站立再回到地面的完整流程","肩关节稳定性+全身协调"]), commonErrors: arr(["眼睛不看着壶铃","分步动作不流畅"]) },

    // === 弓步/泽奇深蹲及其他补充训练 ===

    // -- 主体: 泽奇深蹲 & 弓步变式 --
    { name: "泽奇深蹲", nameEn: "Zercher Squat", category: "STRENGTH", movementPattern: "SQUAT", primaryMuscles: arr(["QUADRICEPS","GLUTES"]), secondaryMuscles: arr(["HAMSTRINGS","ERECTOR_SPINAE","BICEPS","RECTUS_ABDOMINIS"]), equipment: arr(["BARBELL"]), difficulty: "ADVANCED", sessionRole: "MAIN", coachingCues: arr(["杠铃置于肘弯处","双手交叉抱紧固定","挺胸保持躯干直立","下蹲至大腿平行地面","强化核心+上肢等长+下肢力量"]), commonErrors: arr(["肘部滑落","上半身前倾过多","杠铃压住呼吸困难"]) },
    { name: "负重弓步走", nameEn: "Loaded Walking Lunge", category: "STRENGTH", movementPattern: "SQUAT", primaryMuscles: arr(["QUADRICEPS","GLUTES","HAMSTRINGS"]), secondaryMuscles: arr(["CALVES","RECTUS_ABDOMINIS","HIP_FLEXORS"]), equipment: arr(["DUMBBELL","KETTLEBELL","BARBELL"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["双手/杠铃持负重","前膝不超脚尖","后膝轻触地面","步幅适中保持平衡","交替前进"]), commonErrors: arr(["前膝过度前移","后膝重砸地面","步幅太短","身体左右摇晃"]) },
    { name: "反向弓步", nameEn: "Reverse Lunge", category: "STRENGTH", movementPattern: "SQUAT", primaryMuscles: arr(["QUADRICEPS","GLUTES","HAMSTRINGS"]), secondaryMuscles: arr(["CALVES","HIP_FLEXORS"]), equipment: arr(["DUMBBELL","KETTLEBELL","BARBELL"]), difficulty: "BEGINNER", sessionRole: "MAIN", coachingCues: arr(["向后迈步下蹲","前膝保持稳定不内扣","后膝轻触地面","推回起始位","对膝关节更友好"]), commonErrors: arr(["前膝内扣","上半身前倾","后腿发力不足","回程不稳"]) },
    { name: "侧向弓步", nameEn: "Lateral Lunge", category: "WARMUP", movementPattern: "SQUAT", primaryMuscles: arr(["HIP_ADDUCTORS","HIP_ABDUCTORS","GLUTES"]), secondaryMuscles: arr(["QUADRICEPS"]), equipment: arr(["BODYWEIGHT"]), difficulty: "BEGINNER", sessionRole: "WARMUP", coachingCues: arr(["自重侧向迈步","弯曲迈出腿","另一腿保持伸直","控制节奏","激活内收和外展肌群","适合热身激活"]), commonErrors: arr(["迈步腿膝盖内扣","重心太高","动作过快"]) },
    { name: "过顶弓步", nameEn: "Overhead Lunge", category: "STRENGTH", movementPattern: "SQUAT", primaryMuscles: arr(["QUADRICEPS","GLUTES","ANTERIOR_DELTOID"]), secondaryMuscles: arr(["TRICEPS","RECTUS_ABDOMINIS","ERECTOR_SPINAE"]), equipment: arr(["BARBELL","DUMBBELL","KETTLEBELL"]), difficulty: "ADVANCED", sessionRole: "MAIN", coachingCues: arr(["负重举过头顶","保持手臂锁定","核心高度紧绷","弓步下蹲时躯干不倾斜","全身稳定性训练"]), commonErrors: arr(["负重前倾","手臂弯曲","核心松弛","下蹲幅度不足"]) },

    // -- 主体: 其他补充 --
    { name: "负重登阶", nameEn: "Weighted Step-Up", category: "STRENGTH", movementPattern: "SQUAT", primaryMuscles: arr(["QUADRICEPS","GLUTES"]), secondaryMuscles: arr(["HAMSTRINGS","CALVES"]), equipment: arr(["DUMBBELL","KETTLEBELL","PLYO_BOX","BENCH"]), difficulty: "BEGINNER", sessionRole: "MAIN", coachingCues: arr(["选择合适高度的箱/凳","单脚登阶发力","另一腿不借力蹬","顶部完全站立","控制下放回起始"]), commonErrors: arr(["后腿蹬地借力","箱子太高","上半身前倾","落地时无控制"]) },
    { name: "哑铃耸肩", nameEn: "Dumbbell Shrug", category: "STRENGTH", movementPattern: "OTHER", primaryMuscles: arr(["TRAPEZIUS"]), secondaryMuscles: arr(["FOREARMS","RHOMBOIDS"]), equipment: arr(["DUMBBELL","BARBELL"]), difficulty: "BEGINNER", sessionRole: "MAIN", coachingCues: arr(["大重量哑铃","直臂垂于体侧","肩部向耳朵方向耸","顶部暂停1-2秒","不要旋转肩膀"]), commonErrors: arr(["旋转肩膀","借力甩","用二头肌代偿"]) },
    { name: "双杠臂屈伸", nameEn: "Parallel Bar Dip", category: "STRENGTH", movementPattern: "PUSH_VERTICAL", primaryMuscles: arr(["TRICEPS","PECTORALIS","ANTERIOR_DELTOID"]), secondaryMuscles: arr(["LATISSIMUS_DORSI","RECTUS_ABDOMINIS"]), equipment: arr(["OTHER"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["双杠支撑","屈肘下放至肩低于肘","爆发性推起","躯干微前倾(胸)或直立(三头)"]), commonErrors: arr(["下放过深伤肩","摆动借力","半程动作","耸肩"]) },
    { name: "山羊挺身", nameEn: "Back Extension (Hyperextension)", category: "STRENGTH", movementPattern: "HINGE", primaryMuscles: arr(["ERECTOR_SPINAE","GLUTES","HAMSTRINGS"]), secondaryMuscles: arr([]), equipment: arr(["OTHER"]), difficulty: "BEGINNER", sessionRole: "MAIN", coachingCues: arr(["罗马椅/山羊凳","髋部置于垫上","保持背部平直","控制弯下和起身","下背+臀+腘绳后链训练"]), commonErrors: arr(["过度拱腰","借惯性甩","活动范围过大"]) },
    { name: "早安式", nameEn: "Good Morning", category: "STRENGTH", movementPattern: "HINGE", primaryMuscles: arr(["HAMSTRINGS","GLUTES","ERECTOR_SPINAE"]), secondaryMuscles: arr(["RECTUS_ABDOMINIS"]), equipment: arr(["BARBELL"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["杠铃置于斜方肌上","膝盖微屈","髋部后移俯身","保持背部平直","腘绳肌拉伸再起身"]), commonErrors: arr(["圆背","膝盖弯曲过多变成深蹲","重量过大失控制"]) },
    { name: "直腿硬拉", nameEn: "Stiff-Leg Deadlift", category: "STRENGTH", movementPattern: "HINGE", primaryMuscles: arr(["HAMSTRINGS","GLUTES","ERECTOR_SPINAE"]), secondaryMuscles: arr(["FOREARMS"]), equipment: arr(["BARBELL","DUMBBELL"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["膝盖微屈近乎伸直","髋部后移","杠铃贴腿下放","感受腘绳肌强烈拉伸","强调离心控制"]), commonErrors: arr(["圆背","膝盖锁死超伸","杠铃远离身体","下放太快"]) },

    // -- 辅助训练补充 --
    { name: "锤式弯举", nameEn: "Hammer Curl", category: "STRENGTH", movementPattern: "OTHER", primaryMuscles: arr(["BICEPS","FOREARMS"]), secondaryMuscles: arr(["ANTERIOR_DELTOID"]), equipment: arr(["DUMBBELL"]), difficulty: "BEGINNER", sessionRole: "ACCESSORY", coachingCues: arr(["掌心相对(中立握)","肘部贴紧身体","控制全程","侧重肱肌和前臂"]), commonErrors: arr(["借力甩","肘部前移","半程动作"]) },
    { name: "仰卧臂屈伸", nameEn: "Skull Crusher (Lying Tricep Extension)", category: "STRENGTH", movementPattern: "OTHER", primaryMuscles: arr(["TRICEPS"]), secondaryMuscles: arr(["FOREARMS"]), equipment: arr(["BARBELL","DUMBBELL","BENCH"]), difficulty: "INTERMEDIATE", sessionRole: "ACCESSORY", coachingCues: arr(["仰卧/平凳","杠铃/哑铃降至额头前方","只屈伸肘关节","控制全程","孤立肱三头肌"]), commonErrors: arr(["肘部外展","大臂晃动","重量过大","砸到脸"]) },
    { name: "坐姿哑铃推举", nameEn: "Seated Dumbbell Press", category: "STRENGTH", movementPattern: "PUSH_VERTICAL", primaryMuscles: arr(["ANTERIOR_DELTOID","MEDIAL_DELTOID"]), secondaryMuscles: arr(["TRICEPS","TRAPEZIUS"]), equipment: arr(["DUMBBELL","BENCH"]), difficulty: "INTERMEDIATE", sessionRole: "MAIN", coachingCues: arr(["坐姿背部靠凳","哑铃从肩部高度推起","控制下放","比站姿更稳定更专注肩部"]), commonErrors: arr(["下放太低","哑铃碰撞","借力后仰"]) },
    { name: "反向飞鸟(蝴蝶机)", nameEn: "Reverse Pec Deck Fly", category: "STRENGTH", movementPattern: "PULL_HORIZONTAL", primaryMuscles: arr(["POSTERIOR_DELTOID","RHOMBOIDS"]), secondaryMuscles: arr(["TRAPEZIUS","ROTATOR_CUFF"]), equipment: arr(["OTHER"]), difficulty: "BEGINNER", sessionRole: "ACCESSORY", coachingCues: arr(["调整座椅使手柄与肩同高","手臂微屈","向后打开至肩胛骨夹紧","控制回程","发展肩后束"]), commonErrors: arr(["借力甩","耸肩","重量太大"]) },
    { name: "俄罗斯转体", nameEn: "Russian Twist", category: "CORE", movementPattern: "ROTATION", primaryMuscles: arr(["OBLIQUES","RECTUS_ABDOMINIS"]), secondaryMuscles: arr(["HIP_FLEXORS"]), equipment: arr(["BODYWEIGHT","MEDICINE_BALL","DUMBBELL"]), difficulty: "BEGINNER", sessionRole: "ACCESSORY", coachingCues: arr(["坐姿身体后倾45度","持药球/哑铃左右旋转","双脚离地(进阶)","控制旋转幅度","腹斜肌训练"]), commonErrors: arr(["只用肩膀转","身体后倾不够","借惯性甩"]) },
    { name: "登山者", nameEn: "Mountain Climber", category: "CORE", movementPattern: "GAIT", primaryMuscles: arr(["RECTUS_ABDOMINIS","HIP_FLEXORS"]), secondaryMuscles: arr(["ANTERIOR_DELTOID","QUADRICEPS"]), equipment: arr(["BODYWEIGHT"]), difficulty: "BEGINNER", sessionRole: "WARMUP", coachingCues: arr(["平板支撑位","交替提膝到胸前","保持核心收紧臀部不抬高","快速交替(代谢)或慢速控制(核心)"]), commonErrors: arr(["臀部抬太高","核心松弛","动作幅度不够"]) },
    { name: "卷腹", nameEn: "Crunch", category: "CORE", movementPattern: "CORE_BRACE", primaryMuscles: arr(["RECTUS_ABDOMINIS"]), secondaryMuscles: arr(["OBLIQUES"]), equipment: arr(["BODYWEIGHT"]), difficulty: "BEGINNER", sessionRole: "ACCESSORY", coachingCues: arr(["仰卧屈膝","下巴不要贴胸","肩胛骨离地即可","顶峰收缩1秒","腹直肌孤立训练"]), commonErrors: arr(["用脖子发力","幅度过大变成仰卧起坐","憋气"]) },
    { name: "波比跳", nameEn: "Burpee", category: "POWER", movementPattern: "PLYOMETRIC", primaryMuscles: arr(["QUADRICEPS","PECTORALIS","RECTUS_ABDOMINIS"]), secondaryMuscles: arr(["GLUTES","TRICEPS","ANTERIOR_DELTOID"]), equipment: arr(["BODYWEIGHT"]), difficulty: "INTERMEDIATE", sessionRole: "WARMUP", coachingCues: arr(["从站立→下蹲→平板→俯卧撑→跳回→爆发跳起","全身代谢训练","神经激活+心肺"]), commonErrors: arr(["动作不标准","跳跃落地太硬","后半段偷懒"]) },
  ]

  console.log(`Creating ${exercises.length} exercises...`)
  let idx = 0
  for (const ex of exercises) {
    await prisma.exercise.upsert({
      where: { id: `seed-${ex.name}` },
      update: {
        name: ex.name, nameEn: ex.nameEn ?? null, category: ex.category,
        movementPattern: ex.movementPattern, primaryMuscles: ex.primaryMuscles,
        secondaryMuscles: ex.secondaryMuscles ?? "[]", equipment: ex.equipment,
        difficulty: ex.difficulty, sessionRole: ex.sessionRole,
        coachingCues: ex.coachingCues, commonErrors: ex.commonErrors,
        isNscaStandard: ex.isNscaStandard ?? false, sports: "[]",
      },
      create: {
        id: `seed-${ex.name}`, name: ex.name, nameEn: ex.nameEn ?? null,
        category: ex.category, movementPattern: ex.movementPattern,
        primaryMuscles: ex.primaryMuscles, secondaryMuscles: ex.secondaryMuscles ?? "[]",
        equipment: ex.equipment, difficulty: ex.difficulty, sessionRole: ex.sessionRole,
        coachingCues: ex.coachingCues, commonErrors: ex.commonErrors,
        isNscaStandard: ex.isNscaStandard ?? false, sports: "[]",
      },
    })
    idx++
    if (idx % 20 === 0) {
      await new Promise(r => setTimeout(r, 200))
      console.log(`  ...${idx}/${exercises.length}`)
    }
  }

  // 模板
  const templates = [
    { name: "拳击12周备战训练营", description: "GPP(2周)→SPP(3周)→专项力量(3周)→赛前峰值(2周)→比赛周, 适合拳击/泰拳/散打运动员", sport: "BOXING", goal: "PEAKING", periodizationModel: "BLOCK", durationWeeks: 12, sessionsPerWeek: 4 },
    { name: "MMA 10周备战营", description: "兼顾站立和地面体能需求, 板块周期, 强调握力+颈部+旋转爆发力+无氧间歇", sport: "MMA", goal: "SPORT_PERFORMANCE", periodizationModel: "BLOCK", durationWeeks: 10, sessionsPerWeek: 4 },
    { name: "摔跤/柔术8周力量期", description: "线性周期: 肌肥大(2周)→最大力量(4周)→爆发力(2周), 强调握力耐力+核心抗旋+等长力量", sport: "WRESTLING", goal: "MAX_STRENGTH", periodizationModel: "LINEAR", durationWeeks: 8, sessionsPerWeek: 3 },
    { name: "篮球16周休赛期", description: "肌肥大(4周)→最大力量(6周)→爆发力+弹跳(6周), 包含损伤预防训练(腘绳肌/肩袖/踝关节)", sport: "BASKETBALL", goal: "POWER", periodizationModel: "LINEAR", durationWeeks: 16, sessionsPerWeek: 4 },
    { name: "篮球6周季前转化", description: "维持力量+爆发力转化+敏捷性+重复冲刺, 日波动周期模拟比赛强度", sport: "BASKETBALL", goal: "SPORT_PERFORMANCE", periodizationModel: "UNDULATING_DAILY", durationWeeks: 6, sessionsPerWeek: 3 },
    { name: "格斗+篮球综合12周", description: "双修运动员, 共享爆发力+核心训练, 周波动周期动态负荷平衡", sport: "COMBAT", goal: "SPORT_PERFORMANCE", periodizationModel: "UNDULATING_WEEKLY", durationWeeks: 12, sessionsPerWeek: 4 },
    { name: "力量举16周周期", description: "肌肥大积累(5周)→力量发展(7周)→峰值减载(4周), 线性周期, 专注三大项提升", sport: "POWERLIFTING", goal: "MAX_STRENGTH", periodizationModel: "LINEAR", durationWeeks: 16, sessionsPerWeek: 4 },
    { name: "大众健身12周综合体能", description: "适合普通健身人群, 肌肥大(3周)→力量(4周)→爆发力+体能(3周)→恢复(2周), 全面发展", sport: "GENERAL_FITNESS", goal: "GENERAL_FITNESS", periodizationModel: "LINEAR", durationWeeks: 12, sessionsPerWeek: 3 },
    { name: "足球赛季前8周准备", description: "基础力量(3周)→爆发力+速度(3周)→结合球训练转化(2周), 强调腘绳肌和单侧力量", sport: "FOOTBALL", goal: "SPORT_PERFORMANCE", periodizationModel: "BLOCK", durationWeeks: 8, sessionsPerWeek: 3 },
    { name: "游泳12周陆上力量", description: "基础力量(4周)→爆发力(4周)→维持(4周), 侧重肩部+核心+髋驱动力量, 损伤预防", sport: "SWIMMING", goal: "MAX_STRENGTH", periodizationModel: "LINEAR", durationWeeks: 12, sessionsPerWeek: 3 },
  ]

  console.log(`Creating ${templates.length} templates...`)
  for (const tpl of templates) {
    await prisma.programmeTemplate.upsert({
      where: { id: `seed-tpl-${tpl.name}` },
      update: { ...tpl, createdById: coach.id },
      create: { id: `seed-tpl-${tpl.name}`, ...tpl, createdById: coach.id },
    })
  }

  console.log(`Seed complete! Created ${exercises.length} exercises + ${templates.length} templates.`)
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(async () => { await prisma.$disconnect() })
