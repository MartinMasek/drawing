/*
  Warnings:

  - You are about to drop the column `bumpInLength` on the `Corner` table. All the data in the column will be lost.
  - You are about to drop the column `bumpOutDepth` on the `Corner` table. All the data in the column will be lost.
  - You are about to drop the column `bumpOutLength` on the `Corner` table. All the data in the column will be lost.
  - You are about to drop the column `cornerModification` on the `Corner` table. All the data in the column will be lost.
  - You are about to drop the column `linkedService` on the `Corner` table. All the data in the column will be lost.
  - The `type` column on the `Corner` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `linkedService` on the `Edge` table. All the data in the column will be lost.
  - You are about to drop the column `endEdgeId` on the `Shape` table. All the data in the column will be lost.
  - You are about to drop the column `startEdgeId` on the `Shape` table. All the data in the column will be lost.
  - You are about to drop the `EdgeShape` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."EdgeShapePosition" AS ENUM ('Right', 'Center', 'Left');

-- CreateEnum
CREATE TYPE "public"."EdgeModificationType" AS ENUM ('BumpIn', 'BumpOut', 'BumpInCurve', 'BumpOutCurve', 'FullCurve', 'None');

-- CreateEnum
CREATE TYPE "public"."CornerType" AS ENUM ('Clip', 'Radius', 'BumpOut', 'Notch', 'None');

-- DropForeignKey
ALTER TABLE "public"."EdgeShape" DROP CONSTRAINT "EdgeShape_edgeId_fkey";

-- AlterTable
ALTER TABLE "public"."Corner" DROP COLUMN "bumpInLength",
DROP COLUMN "bumpOutDepth",
DROP COLUMN "bumpOutLength",
DROP COLUMN "cornerModification",
DROP COLUMN "linkedService",
ADD COLUMN     "linkedServiceId" TEXT,
ADD COLUMN     "modificationDepth" DOUBLE PRECISION,
ADD COLUMN     "modificationLength" DOUBLE PRECISION,
DROP COLUMN "type",
ADD COLUMN     "type" "public"."CornerType" NOT NULL DEFAULT 'None',
ALTER COLUMN "radius" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Edge" DROP COLUMN "linkedService",
ADD COLUMN     "linkedServiceId" TEXT;

-- AlterTable
ALTER TABLE "public"."Shape" DROP COLUMN "endEdgeId",
DROP COLUMN "startEdgeId",
ADD COLUMN     "endPoint1Id" TEXT,
ADD COLUMN     "endPoint2Id" TEXT,
ADD COLUMN     "startPoint1Id" TEXT,
ADD COLUMN     "startPoint2Id" TEXT;

-- DropTable
DROP TABLE "public"."EdgeShape";

-- CreateTable
CREATE TABLE "public"."EdgeModification" (
    "id" TEXT NOT NULL,
    "edgeType" "public"."EdgeModificationType" NOT NULL DEFAULT 'None',
    "position" "public"."EdgeShapePosition" DEFAULT 'Center',
    "distance" DOUBLE PRECISION,
    "depth" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "sideAngleLeft" DOUBLE PRECISION,
    "sideAngleRight" DOUBLE PRECISION,
    "fullRadiusDepth" DOUBLE PRECISION,
    "edgeId" TEXT NOT NULL,

    CONSTRAINT "EdgeModification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Shape" ADD CONSTRAINT "Shape_startPoint1Id_fkey" FOREIGN KEY ("startPoint1Id") REFERENCES "public"."Point"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shape" ADD CONSTRAINT "Shape_startPoint2Id_fkey" FOREIGN KEY ("startPoint2Id") REFERENCES "public"."Point"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shape" ADD CONSTRAINT "Shape_endPoint1Id_fkey" FOREIGN KEY ("endPoint1Id") REFERENCES "public"."Point"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shape" ADD CONSTRAINT "Shape_endPoint2Id_fkey" FOREIGN KEY ("endPoint2Id") REFERENCES "public"."Point"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Edge" ADD CONSTRAINT "Edge_point1Id_fkey" FOREIGN KEY ("point1Id") REFERENCES "public"."Point"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Edge" ADD CONSTRAINT "Edge_point2Id_fkey" FOREIGN KEY ("point2Id") REFERENCES "public"."Point"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EdgeModification" ADD CONSTRAINT "EdgeModification_edgeId_fkey" FOREIGN KEY ("edgeId") REFERENCES "public"."Edge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
