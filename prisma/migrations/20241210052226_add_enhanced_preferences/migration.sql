/*
  Warnings:

  - Added the required column `updatedAt` to the `UserPreferences` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserPreferences" ADD COLUMN     "activityPrefs" JSONB,
ADD COLUMN     "comfortPrefs" JSONB,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "defaultActivity" TEXT,
ADD COLUMN     "groupTrips" JSONB,
ADD COLUMN     "maxDistance" INTEGER,
ADD COLUMN     "packingLists" JSONB,
ADD COLUMN     "preferredTimes" TEXT[],
ADD COLUMN     "skillLevel" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "weatherPrefs" JSONB;

-- CreateTable
CREATE TABLE "RouteHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startPoint" JSONB NOT NULL,
    "endPoint" JSONB NOT NULL,
    "activityType" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "weather" JSONB,
    "rating" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RouteHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "choices" JSONB NOT NULL,
    "preferences" JSONB NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupTrip" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "members" JSONB NOT NULL,
    "preferences" JSONB NOT NULL,
    "packingList" JSONB NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupTrip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RouteHistory_userId_idx" ON "RouteHistory"("userId");

-- CreateIndex
CREATE INDEX "RouteHistory_timestamp_idx" ON "RouteHistory"("timestamp");

-- CreateIndex
CREATE INDEX "ActivityHistory_userId_idx" ON "ActivityHistory"("userId");

-- CreateIndex
CREATE INDEX "GroupTrip_createdBy_idx" ON "GroupTrip"("createdBy");

-- CreateIndex
CREATE INDEX "UserPreferences_userId_idx" ON "UserPreferences"("userId");

-- AddForeignKey
ALTER TABLE "ActivityHistory" ADD CONSTRAINT "ActivityHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupTrip" ADD CONSTRAINT "GroupTrip_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
