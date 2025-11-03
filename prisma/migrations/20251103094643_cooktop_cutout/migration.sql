-- CreateTable
CREATE TABLE "public"."CooktopCutout" (
    "id" TEXT NOT NULL,
    "posX" DOUBLE PRECISION NOT NULL,
    "posY" DOUBLE PRECISION NOT NULL,
    "shapeId" TEXT NOT NULL,
    "configId" TEXT NOT NULL,

    CONSTRAINT "CooktopCutout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CooktopCutoutConfig" (
    "id" TEXT NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "burnerCount" INTEGER NOT NULL,
    "centrelinesX" "public"."CentrelinesX" NOT NULL DEFAULT 'Left',
    "centrelinesY" "public"."CentrelinesY" NOT NULL DEFAULT 'Top',

    CONSTRAINT "CooktopCutoutConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CooktopCutout_configId_key" ON "public"."CooktopCutout"("configId");

-- AddForeignKey
ALTER TABLE "public"."CooktopCutout" ADD CONSTRAINT "CooktopCutout_shapeId_fkey" FOREIGN KEY ("shapeId") REFERENCES "public"."Shape"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CooktopCutout" ADD CONSTRAINT "CooktopCutout_configId_fkey" FOREIGN KEY ("configId") REFERENCES "public"."CooktopCutoutConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
