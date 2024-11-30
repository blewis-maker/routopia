-- CreateEnum
CREATE TYPE "RouteType" AS ENUM ('CAR', 'BIKE', 'SKI');

-- CreateEnum
CREATE TYPE "RouteStatus" AS ENUM ('DRAFT', 'PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "preferences" JSONB,
    "skillLevels" JSONB,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "routeType" "RouteType" NOT NULL,
    "status" "RouteStatus" NOT NULL,
    "plannedFor" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "budgetConstraint" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "weatherReqs" JSONB,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_nodes" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "nodeType" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "targetArrival" TIMESTAMP(3),
    "status" TEXT,
    "providerData" JSONB,
    "costEstimate" DOUBLE PRECISION,

    CONSTRAINT "route_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "node_metadata" (
    "id" TEXT NOT NULL,
    "routeNodeId" TEXT NOT NULL,
    "weatherData" JSONB,
    "trafficData" JSONB,
    "openingHours" JSONB,
    "reviews" JSONB,

    CONSTRAINT "node_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_routes" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "elevationData" JSONB,
    "difficultyRating" JSONB,
    "trailConditions" JSONB,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_points" (
    "id" TEXT NOT NULL,
    "activityRouteId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "elevation" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3),
    "heartRate" INTEGER,
    "power" INTEGER,

    CONSTRAINT "activity_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_plans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourcePlatform" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "trainingZones" JSONB,
    "weeklyTargets" JSONB,

    CONSTRAINT "training_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_types" (
    "id" TEXT NOT NULL,
    "trainingPlanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" DOUBLE PRECISION NOT NULL,
    "intensity" TEXT NOT NULL,

    CONSTRAINT "workout_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "makeModel" TEXT,
    "connectionDetails" JSONB,
    "lastSync" TIMESTAMP(3),

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" JSONB,
    "duration" DOUBLE PRECISION,
    "satisfactionRating" DOUBLE PRECISION,

    CONSTRAINT "activity_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_metrics" (
    "id" TEXT NOT NULL,
    "activityHistoryId" TEXT NOT NULL,
    "distance" DOUBLE PRECISION,
    "avgSpeed" DOUBLE PRECISION,
    "maxSpeed" DOUBLE PRECISION,
    "avgPower" DOUBLE PRECISION,
    "maxPower" DOUBLE PRECISION,
    "avgHeartRate" INTEGER,
    "maxHeartRate" INTEGER,
    "calories" INTEGER,

    CONSTRAINT "performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_syncs" (
    "id" TEXT NOT NULL,
    "activityHistoryId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "lastSynced" TIMESTAMP(3) NOT NULL,
    "syncData" JSONB,

    CONSTRAINT "external_syncs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_interactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "routeId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userInput" TEXT NOT NULL,
    "aiResponse" TEXT NOT NULL,
    "contextData" JSONB,

    CONSTRAINT "chat_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_alerts" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "route_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_alerts" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "severity" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weather_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_generation_params" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "constraints" JSONB,
    "priorityFactors" JSONB,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "route_generation_params_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "node_metadata_routeNodeId_key" ON "node_metadata"("routeNodeId");

-- CreateIndex
CREATE UNIQUE INDEX "activity_routes_routeId_key" ON "activity_routes"("routeId");

-- CreateIndex
CREATE UNIQUE INDEX "performance_metrics_activityHistoryId_key" ON "performance_metrics"("activityHistoryId");

-- CreateIndex
CREATE UNIQUE INDEX "route_generation_params_routeId_key" ON "route_generation_params"("routeId");

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_nodes" ADD CONSTRAINT "route_nodes_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node_metadata" ADD CONSTRAINT "node_metadata_routeNodeId_fkey" FOREIGN KEY ("routeNodeId") REFERENCES "route_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_routes" ADD CONSTRAINT "activity_routes_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_points" ADD CONSTRAINT "activity_points_activityRouteId_fkey" FOREIGN KEY ("activityRouteId") REFERENCES "activity_routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_plans" ADD CONSTRAINT "training_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_types" ADD CONSTRAINT "workout_types_trainingPlanId_fkey" FOREIGN KEY ("trainingPlanId") REFERENCES "training_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_history" ADD CONSTRAINT "activity_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_metrics" ADD CONSTRAINT "performance_metrics_activityHistoryId_fkey" FOREIGN KEY ("activityHistoryId") REFERENCES "activity_history"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_syncs" ADD CONSTRAINT "external_syncs_activityHistoryId_fkey" FOREIGN KEY ("activityHistoryId") REFERENCES "activity_history"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_interactions" ADD CONSTRAINT "chat_interactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_interactions" ADD CONSTRAINT "chat_interactions_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_alerts" ADD CONSTRAINT "route_alerts_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weather_alerts" ADD CONSTRAINT "weather_alerts_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_generation_params" ADD CONSTRAINT "route_generation_params_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
