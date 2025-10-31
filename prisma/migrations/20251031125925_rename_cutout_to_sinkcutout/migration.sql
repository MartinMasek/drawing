/*
  Warnings:

  - You are about to drop the `Cutout` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CutoutConfig` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CutoutTemplate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Cutout" DROP CONSTRAINT "Cutout_configId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Cutout" DROP CONSTRAINT "Cutout_shapeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Cutout" DROP CONSTRAINT "Cutout_templateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CutoutConfig" DROP CONSTRAINT "CutoutConfig_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CutoutConfig" DROP CONSTRAINT "CutoutConfig_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CutoutTemplate" DROP CONSTRAINT "CutoutTemplate_configId_fkey";

-- DropTable
DROP TABLE "public"."Cutout";

-- DropTable
DROP TABLE "public"."CutoutConfig";

-- DropTable
DROP TABLE "public"."CutoutTemplate";

-- CreateTable
CREATE TABLE "public"."SinkCutout" (
    "id" TEXT NOT NULL,
    "posX" DOUBLE PRECISION NOT NULL,
    "posY" DOUBLE PRECISION NOT NULL,
    "shapeId" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "templateId" TEXT,

    CONSTRAINT "SinkCutout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SinkCutoutTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "configId" TEXT NOT NULL,

    CONSTRAINT "SinkCutoutTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SinkCutoutConfig" (
    "id" TEXT NOT NULL,
    "sinkType" "public"."CutoutSinkType" NOT NULL,
    "shape" "public"."CutoutShape" NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "holeCount" INTEGER NOT NULL,
    "centrelinesX" "public"."CentrelinesX" NOT NULL DEFAULT 'Left',
    "centrelinesY" "public"."CentrelinesY" NOT NULL DEFAULT 'Top',
    "productId" TEXT,
    "serviceId" TEXT,

    CONSTRAINT "SinkCutoutConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SinkCutout_configId_key" ON "public"."SinkCutout"("configId");

-- CreateIndex
CREATE UNIQUE INDEX "SinkCutoutTemplate_configId_key" ON "public"."SinkCutoutTemplate"("configId");

-- AddForeignKey
ALTER TABLE "public"."SinkCutout" ADD CONSTRAINT "SinkCutout_shapeId_fkey" FOREIGN KEY ("shapeId") REFERENCES "public"."Shape"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SinkCutout" ADD CONSTRAINT "SinkCutout_configId_fkey" FOREIGN KEY ("configId") REFERENCES "public"."SinkCutoutConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SinkCutout" ADD CONSTRAINT "SinkCutout_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."SinkCutoutTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SinkCutoutTemplate" ADD CONSTRAINT "SinkCutoutTemplate_configId_fkey" FOREIGN KEY ("configId") REFERENCES "public"."SinkCutoutConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SinkCutoutConfig" ADD CONSTRAINT "SinkCutoutConfig_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SinkCutoutConfig" ADD CONSTRAINT "SinkCutoutConfig_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
