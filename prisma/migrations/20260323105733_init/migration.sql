-- CreateEnum
CREATE TYPE "AIStatus" AS ENUM ('PENDING', 'CAPTURING', 'WAITING_AI', 'AI_PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PushStatus" AS ENUM ('IDLE', 'PENDING', 'PUSHING', 'PUSHED', 'FAILED');

-- CreateEnum
CREATE TYPE "HotspotType" AS ENUM ('PRED_30', 'PRED_45', 'PRED_60');

-- CreateTable
CREATE TABLE "missions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "drone_name" TEXT NOT NULL,
    "ai_status" "AIStatus" NOT NULL DEFAULT 'PENDING',
    "push_status" "PushStatus" NOT NULL DEFAULT 'IDLE',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "input_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotspots" (
    "id" TEXT NOT NULL,
    "mission_id" TEXT NOT NULL,
    "type" "HotspotType" NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION,
    "geometry" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hotspots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hotspots_mission_id_idx" ON "hotspots"("mission_id");

-- CreateIndex
CREATE INDEX "hotspots_type_idx" ON "hotspots"("type");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_apiKey_key" ON "ApiKey"("apiKey");

-- AddForeignKey
ALTER TABLE "hotspots" ADD CONSTRAINT "hotspots_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
