-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Exercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "description" TEXT,
    "coachingCues" TEXT NOT NULL DEFAULT '[]',
    "commonErrors" TEXT NOT NULL DEFAULT '[]',
    "videoUrl" TEXT,
    "imageUrls" TEXT NOT NULL DEFAULT '[]',
    "movementPattern" TEXT NOT NULL,
    "primaryMuscles" TEXT NOT NULL DEFAULT '[]',
    "secondaryMuscles" TEXT NOT NULL DEFAULT '[]',
    "equipment" TEXT NOT NULL DEFAULT '[]',
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'INTERMEDIATE',
    "bilateral" TEXT NOT NULL DEFAULT 'BILATERAL',
    "sports" TEXT NOT NULL DEFAULT '[]',
    "sessionRole" TEXT NOT NULL DEFAULT 'MAIN',
    "isNscaStandard" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Exercise_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Exercise" ("bilateral", "category", "coachingCues", "commonErrors", "createdAt", "createdById", "description", "difficulty", "equipment", "id", "imageUrls", "isApproved", "isNscaStandard", "movementPattern", "name", "nameEn", "primaryMuscles", "secondaryMuscles", "sports", "updatedAt", "videoUrl") SELECT "bilateral", "category", "coachingCues", "commonErrors", "createdAt", "createdById", "description", "difficulty", "equipment", "id", "imageUrls", "isApproved", "isNscaStandard", "movementPattern", "name", "nameEn", "primaryMuscles", "secondaryMuscles", "sports", "updatedAt", "videoUrl" FROM "Exercise";
DROP TABLE "Exercise";
ALTER TABLE "new_Exercise" RENAME TO "Exercise";
CREATE INDEX "Exercise_category_idx" ON "Exercise"("category");
CREATE INDEX "Exercise_movementPattern_idx" ON "Exercise"("movementPattern");
CREATE INDEX "Exercise_sessionRole_idx" ON "Exercise"("sessionRole");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
