/*
  Warnings:

  - Added the required column `designId` to the `Text` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Text" ADD COLUMN     "designId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Text" ADD CONSTRAINT "Text_designId_fkey" FOREIGN KEY ("designId") REFERENCES "public"."Design"("id") ON DELETE CASCADE ON UPDATE CASCADE;
