/*
  Warnings:

  - Added the required column `SKU` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subcategory` to the `Material` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Material" ADD COLUMN     "SKU" TEXT NOT NULL,
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "img" TEXT,
ADD COLUMN     "subcategory" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Shape" ADD COLUMN     "materialId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Shape" ADD CONSTRAINT "Shape_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "public"."Material"("id") ON DELETE SET NULL ON UPDATE CASCADE;
