-- CreateTable
CREATE TABLE "public"."Design" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Design_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Shape" (
    "id" TEXT NOT NULL,
    "xPos" DOUBLE PRECISION NOT NULL,
    "yPos" DOUBLE PRECISION NOT NULL,
    "rotation" DOUBLE PRECISION NOT NULL,
    "designId" TEXT NOT NULL,
    "startEdgeId" TEXT,
    "endEdgeId" TEXT,

    CONSTRAINT "Shape_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Point" (
    "id" TEXT NOT NULL,
    "xPos" DOUBLE PRECISION NOT NULL,
    "yPos" DOUBLE PRECISION NOT NULL,
    "shapeId" TEXT,

    CONSTRAINT "Point_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Edge" (
    "id" TEXT NOT NULL,
    "shapeId" TEXT NOT NULL,
    "point1Id" TEXT NOT NULL,
    "point2Id" TEXT NOT NULL,
    "linkedService" TEXT,

    CONSTRAINT "Edge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EdgeShape" (
    "id" TEXT NOT NULL,
    "depth" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "edges" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "sideAngleLeft" DOUBLE PRECISION NOT NULL,
    "sideAngleRight" DOUBLE PRECISION NOT NULL,
    "edgeId" TEXT NOT NULL,

    CONSTRAINT "EdgeShape_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Corner" (
    "id" TEXT NOT NULL,
    "pointId" TEXT NOT NULL,
    "cornerModification" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "clip" DOUBLE PRECISION,
    "radius" DOUBLE PRECISION NOT NULL,
    "bumpInLength" DOUBLE PRECISION,
    "bumpOutLength" DOUBLE PRECISION,
    "bumpOutDepth" DOUBLE PRECISION,
    "linkedService" TEXT,
    "shapeId" TEXT NOT NULL,

    CONSTRAINT "Corner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Cutout" (
    "id" TEXT NOT NULL,
    "posX" DOUBLE PRECISION NOT NULL,
    "posY" DOUBLE PRECISION NOT NULL,
    "shapeId" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "templateId" TEXT,

    CONSTRAINT "Cutout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CutoutTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "configId" TEXT NOT NULL,

    CONSTRAINT "CutoutTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CutoutConfig" (
    "id" TEXT NOT NULL,
    "sinkType" TEXT NOT NULL,
    "shape" TEXT NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "holeCount" INTEGER NOT NULL,
    "centerRules" TEXT,
    "faucetRules" TEXT,
    "productId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "CutoutConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BacksplashConfig" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "edgeId" TEXT NOT NULL,

    CONSTRAINT "BacksplashConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WaterfallConfig" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "edgeId" TEXT NOT NULL,

    CONSTRAINT "WaterfallConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Material" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Corner_pointId_key" ON "public"."Corner"("pointId");

-- CreateIndex
CREATE UNIQUE INDEX "Cutout_configId_key" ON "public"."Cutout"("configId");

-- CreateIndex
CREATE UNIQUE INDEX "CutoutTemplate_configId_key" ON "public"."CutoutTemplate"("configId");

-- CreateIndex
CREATE UNIQUE INDEX "BacksplashConfig_edgeId_key" ON "public"."BacksplashConfig"("edgeId");

-- CreateIndex
CREATE UNIQUE INDEX "WaterfallConfig_edgeId_key" ON "public"."WaterfallConfig"("edgeId");

-- AddForeignKey
ALTER TABLE "public"."Shape" ADD CONSTRAINT "Shape_designId_fkey" FOREIGN KEY ("designId") REFERENCES "public"."Design"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Point" ADD CONSTRAINT "Point_shapeId_fkey" FOREIGN KEY ("shapeId") REFERENCES "public"."Shape"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Edge" ADD CONSTRAINT "Edge_shapeId_fkey" FOREIGN KEY ("shapeId") REFERENCES "public"."Shape"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EdgeShape" ADD CONSTRAINT "EdgeShape_edgeId_fkey" FOREIGN KEY ("edgeId") REFERENCES "public"."Edge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Corner" ADD CONSTRAINT "Corner_pointId_fkey" FOREIGN KEY ("pointId") REFERENCES "public"."Point"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Corner" ADD CONSTRAINT "Corner_shapeId_fkey" FOREIGN KEY ("shapeId") REFERENCES "public"."Shape"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cutout" ADD CONSTRAINT "Cutout_shapeId_fkey" FOREIGN KEY ("shapeId") REFERENCES "public"."Shape"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cutout" ADD CONSTRAINT "Cutout_configId_fkey" FOREIGN KEY ("configId") REFERENCES "public"."CutoutConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cutout" ADD CONSTRAINT "Cutout_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."CutoutTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CutoutTemplate" ADD CONSTRAINT "CutoutTemplate_configId_fkey" FOREIGN KEY ("configId") REFERENCES "public"."CutoutConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CutoutConfig" ADD CONSTRAINT "CutoutConfig_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CutoutConfig" ADD CONSTRAINT "CutoutConfig_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BacksplashConfig" ADD CONSTRAINT "BacksplashConfig_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BacksplashConfig" ADD CONSTRAINT "BacksplashConfig_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "public"."Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BacksplashConfig" ADD CONSTRAINT "BacksplashConfig_edgeId_fkey" FOREIGN KEY ("edgeId") REFERENCES "public"."Edge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WaterfallConfig" ADD CONSTRAINT "WaterfallConfig_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WaterfallConfig" ADD CONSTRAINT "WaterfallConfig_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "public"."Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WaterfallConfig" ADD CONSTRAINT "WaterfallConfig_edgeId_fkey" FOREIGN KEY ("edgeId") REFERENCES "public"."Edge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
