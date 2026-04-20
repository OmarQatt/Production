-- AlterTable
ALTER TABLE "Location" ADD COLUMN "amenities" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Talent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "skinTone" TEXT,
    "height" INTEGER,
    "weight" INTEGER,
    "city" TEXT NOT NULL,
    "positions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Talent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Talent" ("age", "city", "createdAt", "experience", "gender", "height", "id", "positions", "skinTone", "type", "updatedAt", "userId", "weight") SELECT "age", "city", "createdAt", "experience", "gender", "height", "id", "positions", "skinTone", "type", "updatedAt", "userId", "weight" FROM "Talent";
DROP TABLE "Talent";
ALTER TABLE "new_Talent" RENAME TO "Talent";
CREATE UNIQUE INDEX "Talent_userId_key" ON "Talent"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
