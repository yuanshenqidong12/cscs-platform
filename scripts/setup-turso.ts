import "dotenv/config";
import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env["DATABASE_URL"]!,
});

const statements = [
  `CREATE TABLE IF NOT EXISTS User (
    id TEXT PRIMARY KEY NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    passwordHash TEXT,
    role TEXT NOT NULL DEFAULT 'COACH',
    organization TEXT,
    certifications TEXT NOT NULL DEFAULT '[]',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS Account (
    id TEXT PRIMARY KEY NOT NULL,
    userId TEXT NOT NULL REFERENCES User(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    providerAccountId TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    UNIQUE(provider, providerAccountId)
  )`,
  `CREATE TABLE IF NOT EXISTS Athlete (
    id TEXT PRIMARY KEY NOT NULL,
    coachId TEXT NOT NULL REFERENCES User(id),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    dateOfBirth TEXT,
    sex TEXT,
    sport TEXT NOT NULL,
    discipline TEXT,
    weightClass TEXT,
    level TEXT NOT NULL DEFAULT 'AMATEUR',
    trainingAge INTEGER,
    height REAL,
    weight REAL,
    bodyFat REAL,
    injuryHistory TEXT,
    goals TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_athlete_coach ON Athlete(coachId)`,
  `CREATE TABLE IF NOT EXISTS Assessment (
    id TEXT PRIMARY KEY NOT NULL,
    athleteId TEXT NOT NULL REFERENCES Athlete(id) ON DELETE CASCADE,
    coachId TEXT NOT NULL REFERENCES User(id),
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type TEXT NOT NULL,
    results TEXT NOT NULL DEFAULT '{}',
    notes TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_assessment_athlete ON Assessment(athleteId, date)`,
  `CREATE INDEX IF NOT EXISTS idx_assessment_coach ON Assessment(coachId)`,
  `CREATE TABLE IF NOT EXISTS Exercise (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    nameEn TEXT,
    description TEXT,
    coachingCues TEXT NOT NULL DEFAULT '[]',
    commonErrors TEXT NOT NULL DEFAULT '[]',
    videoUrl TEXT,
    imageUrls TEXT NOT NULL DEFAULT '[]',
    movementPattern TEXT NOT NULL,
    primaryMuscles TEXT NOT NULL DEFAULT '[]',
    secondaryMuscles TEXT NOT NULL DEFAULT '[]',
    equipment TEXT NOT NULL DEFAULT '[]',
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'INTERMEDIATE',
    bilateral TEXT NOT NULL DEFAULT 'BILATERAL',
    sports TEXT NOT NULL DEFAULT '[]',
    sessionRole TEXT NOT NULL DEFAULT 'MAIN',
    isNscaStandard BOOLEAN NOT NULL DEFAULT false,
    isApproved BOOLEAN NOT NULL DEFAULT true,
    createdById TEXT REFERENCES User(id),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_exercise_category ON Exercise(category)`,
  `CREATE INDEX IF NOT EXISTS idx_exercise_movement ON Exercise(movementPattern)`,
  `CREATE INDEX IF NOT EXISTS idx_exercise_role ON Exercise(sessionRole)`,
  `CREATE TABLE IF NOT EXISTS ExerciseVariation (
    id TEXT PRIMARY KEY NOT NULL,
    parentId TEXT NOT NULL REFERENCES Exercise(id),
    variationId TEXT NOT NULL REFERENCES Exercise(id),
    variationType TEXT NOT NULL,
    UNIQUE(parentId, variationId)
  )`,
  `CREATE TABLE IF NOT EXISTS Program (
    id TEXT PRIMARY KEY NOT NULL,
    coachId TEXT NOT NULL REFERENCES User(id),
    athleteId TEXT REFERENCES Athlete(id),
    name TEXT NOT NULL,
    sport TEXT,
    goal TEXT NOT NULL,
    periodizationModel TEXT NOT NULL,
    trainingFrequency INTEGER,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    notes TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_program_coach ON Program(coachId)`,
  `CREATE INDEX IF NOT EXISTS idx_program_athlete ON Program(athleteId)`,
  `CREATE TABLE IF NOT EXISTS Mesocycle (
    id TEXT PRIMARY KEY NOT NULL,
    programId TEXT NOT NULL REFERENCES Program(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phase TEXT NOT NULL,
    goal TEXT,
    "order" INTEGER NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    notes TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_mesocycle_program ON Mesocycle(programId, "order")`,
  `CREATE TABLE IF NOT EXISTS Microcycle (
    id TEXT PRIMARY KEY NOT NULL,
    mesocycleId TEXT NOT NULL REFERENCES Mesocycle(id) ON DELETE CASCADE,
    weekNumber INTEGER NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    theme TEXT,
    notes TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mesocycleId, weekNumber)
  )`,
  `CREATE TABLE IF NOT EXISTS Session (
    id TEXT PRIMARY KEY NOT NULL,
    microcycleId TEXT NOT NULL REFERENCES Microcycle(id) ON DELETE CASCADE,
    coachId TEXT NOT NULL REFERENCES User(id),
    dayOfWeek INTEGER NOT NULL,
    date TEXT NOT NULL,
    sessionType TEXT NOT NULL,
    name TEXT,
    warmupNotes TEXT,
    cooldownNotes TEXT,
    notes TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_session_microcycle ON Session(microcycleId)`,
  `CREATE INDEX IF NOT EXISTS idx_session_coach ON Session(coachId, date)`,
  `CREATE TABLE IF NOT EXISTS ExercisePrescription (
    id TEXT PRIMARY KEY NOT NULL,
    sessionId TEXT NOT NULL REFERENCES Session(id) ON DELETE CASCADE,
    exerciseId TEXT NOT NULL REFERENCES Exercise(id),
    "order" INTEGER NOT NULL,
    sets INTEGER,
    reps TEXT,
    loadType TEXT,
    loadValue REAL,
    restSeconds INTEGER,
    tempo TEXT,
    rpe REAL,
    rir INTEGER,
    notes TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_prescription_session ON ExercisePrescription(sessionId, "order")`,
  `CREATE TABLE IF NOT EXISTS LoadPrescription (
    id TEXT PRIMARY KEY NOT NULL,
    prescriptionId TEXT NOT NULL REFERENCES ExercisePrescription(id) ON DELETE CASCADE,
    weekNumber INTEGER NOT NULL,
    loadType TEXT NOT NULL,
    loadValue REAL NOT NULL,
    UNIQUE(prescriptionId, weekNumber)
  )`,
  `CREATE TABLE IF NOT EXISTS SessionCompletion (
    id TEXT PRIMARY KEY NOT NULL,
    sessionId TEXT NOT NULL REFERENCES Session(id),
    athleteId TEXT NOT NULL REFERENCES Athlete(id),
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    rpeSession REAL,
    durationMin INTEGER,
    notes TEXT,
    UNIQUE(sessionId, athleteId, date)
  )`,
  `CREATE TABLE IF NOT EXISTS ProgrammeTemplate (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sport TEXT,
    goal TEXT NOT NULL,
    periodizationModel TEXT NOT NULL,
    durationWeeks INTEGER NOT NULL,
    sessionsPerWeek INTEGER NOT NULL,
    isPublic BOOLEAN NOT NULL DEFAULT false,
    createdById TEXT NOT NULL REFERENCES User(id),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS ProgrammeTemplateExercise (
    id TEXT PRIMARY KEY NOT NULL,
    templateId TEXT NOT NULL REFERENCES ProgrammeTemplate(id) ON DELETE CASCADE,
    exerciseId TEXT NOT NULL REFERENCES Exercise(id),
    phase TEXT NOT NULL,
    dayPattern TEXT,
    "order" INTEGER NOT NULL,
    sets TEXT,
    reps TEXT,
    loadProgression TEXT,
    restSeconds INTEGER,
    notes TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS idx_template_exercise ON ProgrammeTemplateExercise(templateId, phase)`,
];

async function main() {
  for (const stmt of statements) {
    try {
      await turso.execute(stmt);
      console.log("OK:", stmt.slice(0, 60).replace(/\n/g, " "));
    } catch (e: any) {
      console.log("ERR:", e.message?.slice(0, 100));
    }
  }
  console.log("\nDone! Schema pushed to Turso.");
}

main();
