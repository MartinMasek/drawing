/*
  Warnings:

  - Changed the type of `sinkType` on the `CutoutConfig` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `shape` on the `CutoutConfig` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."CutoutSinkType" AS ENUM ('Undermount', 'DropIn', 'Oval', 'Double');

-- CreateEnum
CREATE TYPE "public"."CutoutShape" AS ENUM ('Rectangle', 'Oval', 'Double');

-- DropForeignKey
ALTER TABLE "public"."CutoutConfig" DROP CONSTRAINT "CutoutConfig_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CutoutConfig" DROP CONSTRAINT "CutoutConfig_serviceId_fkey";

-- AlterTable
ALTER TABLE "public"."CutoutConfig" DROP COLUMN "sinkType",
ADD COLUMN     "sinkType" "public"."CutoutSinkType" NOT NULL,
DROP COLUMN "shape",
ADD COLUMN     "shape" "public"."CutoutShape" NOT NULL,
ALTER COLUMN "productId" DROP NOT NULL,
ALTER COLUMN "serviceId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."CutoutConfig" ADD CONSTRAINT "CutoutConfig_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CutoutConfig" ADD CONSTRAINT "CutoutConfig_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
