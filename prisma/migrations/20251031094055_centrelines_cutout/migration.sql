/*
  Warnings:

  - You are about to drop the column `centerRules` on the `CutoutConfig` table. All the data in the column will be lost.
  - You are about to drop the column `faucetRules` on the `CutoutConfig` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."CentrelinesX" AS ENUM ('Left', 'Right');

-- CreateEnum
CREATE TYPE "public"."CentrelinesY" AS ENUM ('Top', 'Bottom');

-- AlterTable
ALTER TABLE "public"."CutoutConfig" DROP COLUMN "centerRules",
DROP COLUMN "faucetRules",
ADD COLUMN     "centrelinesX" "public"."CentrelinesX" NOT NULL DEFAULT 'Left',
ADD COLUMN     "centrelinesY" "public"."CentrelinesY" NOT NULL DEFAULT 'Top';
