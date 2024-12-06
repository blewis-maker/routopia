/*
  Warnings:

  - You are about to drop the column `preferences` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `skillLevels` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `activity_history` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `activity_points` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `activity_routes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chat_interactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `devices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `external_syncs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `node_metadata` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `performance_metrics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `route_alerts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `route_generation_params` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `route_nodes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `routes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `training_plans` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `weather_alerts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workout_types` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "activity_history" DROP CONSTRAINT "activity_history_userId_fkey";

-- DropForeignKey
ALTER TABLE "activity_points" DROP CONSTRAINT "activity_points_activityRouteId_fkey";

-- DropForeignKey
ALTER TABLE "activity_routes" DROP CONSTRAINT "activity_routes_routeId_fkey";

-- DropForeignKey
ALTER TABLE "chat_interactions" DROP CONSTRAINT "chat_interactions_routeId_fkey";

-- DropForeignKey
ALTER TABLE "chat_interactions" DROP CONSTRAINT "chat_interactions_userId_fkey";

-- DropForeignKey
ALTER TABLE "chats" DROP CONSTRAINT "chats_userId_fkey";

-- DropForeignKey
ALTER TABLE "devices" DROP CONSTRAINT "devices_userId_fkey";

-- DropForeignKey
ALTER TABLE "external_syncs" DROP CONSTRAINT "external_syncs_activityHistoryId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_chatId_fkey";

-- DropForeignKey
ALTER TABLE "node_metadata" DROP CONSTRAINT "node_metadata_routeNodeId_fkey";

-- DropForeignKey
ALTER TABLE "performance_metrics" DROP CONSTRAINT "performance_metrics_activityHistoryId_fkey";

-- DropForeignKey
ALTER TABLE "route_alerts" DROP CONSTRAINT "route_alerts_routeId_fkey";

-- DropForeignKey
ALTER TABLE "route_generation_params" DROP CONSTRAINT "route_generation_params_routeId_fkey";

-- DropForeignKey
ALTER TABLE "route_nodes" DROP CONSTRAINT "route_nodes_routeId_fkey";

-- DropForeignKey
ALTER TABLE "routes" DROP CONSTRAINT "routes_userId_fkey";

-- DropForeignKey
ALTER TABLE "training_plans" DROP CONSTRAINT "training_plans_userId_fkey";

-- DropForeignKey
ALTER TABLE "weather_alerts" DROP CONSTRAINT "weather_alerts_routeId_fkey";

-- DropForeignKey
ALTER TABLE "workout_types" DROP CONSTRAINT "workout_types_trainingPlanId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "preferences",
DROP COLUMN "skillLevels",
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "image" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "activity_history";

-- DropTable
DROP TABLE "activity_points";

-- DropTable
DROP TABLE "activity_routes";

-- DropTable
DROP TABLE "chat_interactions";

-- DropTable
DROP TABLE "chats";

-- DropTable
DROP TABLE "devices";

-- DropTable
DROP TABLE "external_syncs";

-- DropTable
DROP TABLE "messages";

-- DropTable
DROP TABLE "node_metadata";

-- DropTable
DROP TABLE "performance_metrics";

-- DropTable
DROP TABLE "route_alerts";

-- DropTable
DROP TABLE "route_generation_params";

-- DropTable
DROP TABLE "route_nodes";

-- DropTable
DROP TABLE "routes";

-- DropTable
DROP TABLE "training_plans";

-- DropTable
DROP TABLE "weather_alerts";

-- DropTable
DROP TABLE "workout_types";

-- DropEnum
DROP TYPE "RouteStatus";

-- DropEnum
DROP TYPE "RouteType";

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "RecentLocation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "place_name" TEXT NOT NULL,
    "center_lat" DOUBLE PRECISION NOT NULL,
    "center_lng" DOUBLE PRECISION NOT NULL,
    "locationType" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecentLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metricsId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityMetrics" (
    "id" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "speed" DOUBLE PRECISION NOT NULL,
    "calories" INTEGER NOT NULL,
    "heartRate" JSONB,
    "cadence" INTEGER,
    "power" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "goal" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workout" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "targetMetricsId" TEXT NOT NULL,
    "actualMetricsId" TEXT,
    "planId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "batteryLevel" INTEGER,
    "manufacturer" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "firmwareVersion" TEXT,
    "lastSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceSettings" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "syncFrequency" TEXT NOT NULL,
    "autoSync" BOOLEAN NOT NULL DEFAULT true,
    "dataTypes" TEXT[],
    "notifications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceSync" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "dataTypes" TEXT[],
    "recordsCount" INTEGER NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceSync_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "RecentLocation_userId_locationType_idx" ON "RecentLocation"("userId", "locationType");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_metricsId_key" ON "Activity"("metricsId");

-- CreateIndex
CREATE UNIQUE INDEX "Workout_targetMetricsId_key" ON "Workout"("targetMetricsId");

-- CreateIndex
CREATE UNIQUE INDEX "Workout_actualMetricsId_key" ON "Workout"("actualMetricsId");

-- CreateIndex
CREATE UNIQUE INDEX "Device_lastSyncId_key" ON "Device"("lastSyncId");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceSettings_deviceId_key" ON "DeviceSettings"("deviceId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentLocation" ADD CONSTRAINT "RecentLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_metricsId_fkey" FOREIGN KEY ("metricsId") REFERENCES "ActivityMetrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingPlan" ADD CONSTRAINT "TrainingPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_targetMetricsId_fkey" FOREIGN KEY ("targetMetricsId") REFERENCES "ActivityMetrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_actualMetricsId_fkey" FOREIGN KEY ("actualMetricsId") REFERENCES "ActivityMetrics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_planId_fkey" FOREIGN KEY ("planId") REFERENCES "TrainingPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_lastSyncId_fkey" FOREIGN KEY ("lastSyncId") REFERENCES "DeviceSync"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceSettings" ADD CONSTRAINT "DeviceSettings_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceSync" ADD CONSTRAINT "DeviceSync_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
