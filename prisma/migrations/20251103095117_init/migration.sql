-- CreateEnum
CREATE TYPE "public"."EdgeShapePosition" AS ENUM ('Right', 'Center', 'Left');

-- CreateEnum
CREATE TYPE "public"."EdgeModificationType" AS ENUM ('BumpIn', 'BumpOut', 'BumpInCurve', 'BumpOutCurve', 'FullCurve', 'None');

-- CreateEnum
CREATE TYPE "public"."CornerType" AS ENUM ('Clip', 'Radius', 'BumpOut', 'Notch', 'None');

-- CreateEnum
CREATE TYPE "public"."CentrelinesX" AS ENUM ('Left', 'Right');

-- CreateEnum
CREATE TYPE "public"."CentrelinesY" AS ENUM ('Top', 'Bottom');

-- CreateEnum
CREATE TYPE "public"."CutoutSinkType" AS ENUM ('Undermount', 'DropIn', 'Oval', 'Double');

-- CreateEnum
CREATE TYPE "public"."CutoutShape" AS ENUM ('Rectangle', 'Oval', 'Double');

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "refresh_token_expires_in" INTEGER,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

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
    "startPoint1Id" TEXT,
    "startPoint2Id" TEXT,
    "endPoint1Id" TEXT,
    "endPoint2Id" TEXT,
    "materialId" TEXT,

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
CREATE TABLE "public"."Text" (
    "id" TEXT NOT NULL,
    "xPos" DOUBLE PRECISION NOT NULL,
    "yPos" DOUBLE PRECISION NOT NULL,
    "text" TEXT NOT NULL,
    "fontSize" INTEGER NOT NULL,
    "isBold" BOOLEAN NOT NULL,
    "isItalic" BOOLEAN NOT NULL,
    "textColor" TEXT NOT NULL,
    "backgroundColor" TEXT NOT NULL,
    "designId" TEXT NOT NULL,

    CONSTRAINT "Text_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Edge" (
    "id" TEXT NOT NULL,
    "shapeId" TEXT NOT NULL,
    "point1Id" TEXT NOT NULL,
    "point2Id" TEXT NOT NULL,
    "linkedServiceId" TEXT,

    CONSTRAINT "Edge_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "public"."Corner" (
    "id" TEXT NOT NULL,
    "type" "public"."CornerType" NOT NULL DEFAULT 'None',
    "clip" DOUBLE PRECISION,
    "radius" DOUBLE PRECISION,
    "modificationLength" DOUBLE PRECISION,
    "modificationDepth" DOUBLE PRECISION,
    "pointId" TEXT NOT NULL,
    "shapeId" TEXT NOT NULL,
    "linkedServiceId" TEXT,

    CONSTRAINT "Corner_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "public"."CooktopCutout" (
    "id" TEXT NOT NULL,
    "posX" DOUBLE PRECISION NOT NULL,
    "posY" DOUBLE PRECISION NOT NULL,
    "shapeId" TEXT NOT NULL,
    "configId" TEXT NOT NULL,

    CONSTRAINT "CooktopCutout_pkey" PRIMARY KEY ("id")
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
    "img" TEXT,
    "SKU" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "public"."_EdgeModificationPoints" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EdgeModificationPoints_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Corner_pointId_key" ON "public"."Corner"("pointId");

-- CreateIndex
CREATE UNIQUE INDEX "SinkCutout_configId_key" ON "public"."SinkCutout"("configId");

-- CreateIndex
CREATE UNIQUE INDEX "CooktopCutout_configId_key" ON "public"."CooktopCutout"("configId");

-- CreateIndex
CREATE UNIQUE INDEX "SinkCutoutTemplate_configId_key" ON "public"."SinkCutoutTemplate"("configId");

-- CreateIndex
CREATE UNIQUE INDEX "BacksplashConfig_edgeId_key" ON "public"."BacksplashConfig"("edgeId");

-- CreateIndex
CREATE UNIQUE INDEX "WaterfallConfig_edgeId_key" ON "public"."WaterfallConfig"("edgeId");

-- CreateIndex
CREATE INDEX "_EdgeModificationPoints_B_index" ON "public"."_EdgeModificationPoints"("B");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shape" ADD CONSTRAINT "Shape_designId_fkey" FOREIGN KEY ("designId") REFERENCES "public"."Design"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shape" ADD CONSTRAINT "Shape_startPoint1Id_fkey" FOREIGN KEY ("startPoint1Id") REFERENCES "public"."Point"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shape" ADD CONSTRAINT "Shape_startPoint2Id_fkey" FOREIGN KEY ("startPoint2Id") REFERENCES "public"."Point"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shape" ADD CONSTRAINT "Shape_endPoint1Id_fkey" FOREIGN KEY ("endPoint1Id") REFERENCES "public"."Point"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shape" ADD CONSTRAINT "Shape_endPoint2Id_fkey" FOREIGN KEY ("endPoint2Id") REFERENCES "public"."Point"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shape" ADD CONSTRAINT "Shape_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "public"."Material"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Point" ADD CONSTRAINT "Point_shapeId_fkey" FOREIGN KEY ("shapeId") REFERENCES "public"."Shape"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Text" ADD CONSTRAINT "Text_designId_fkey" FOREIGN KEY ("designId") REFERENCES "public"."Design"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Edge" ADD CONSTRAINT "Edge_shapeId_fkey" FOREIGN KEY ("shapeId") REFERENCES "public"."Shape"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Edge" ADD CONSTRAINT "Edge_point1Id_fkey" FOREIGN KEY ("point1Id") REFERENCES "public"."Point"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Edge" ADD CONSTRAINT "Edge_point2Id_fkey" FOREIGN KEY ("point2Id") REFERENCES "public"."Point"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EdgeModification" ADD CONSTRAINT "EdgeModification_edgeId_fkey" FOREIGN KEY ("edgeId") REFERENCES "public"."Edge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Corner" ADD CONSTRAINT "Corner_pointId_fkey" FOREIGN KEY ("pointId") REFERENCES "public"."Point"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Corner" ADD CONSTRAINT "Corner_shapeId_fkey" FOREIGN KEY ("shapeId") REFERENCES "public"."Shape"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SinkCutout" ADD CONSTRAINT "SinkCutout_shapeId_fkey" FOREIGN KEY ("shapeId") REFERENCES "public"."Shape"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SinkCutout" ADD CONSTRAINT "SinkCutout_configId_fkey" FOREIGN KEY ("configId") REFERENCES "public"."SinkCutoutConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SinkCutout" ADD CONSTRAINT "SinkCutout_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."SinkCutoutTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CooktopCutout" ADD CONSTRAINT "CooktopCutout_shapeId_fkey" FOREIGN KEY ("shapeId") REFERENCES "public"."Shape"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CooktopCutout" ADD CONSTRAINT "CooktopCutout_configId_fkey" FOREIGN KEY ("configId") REFERENCES "public"."CooktopCutoutConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SinkCutoutTemplate" ADD CONSTRAINT "SinkCutoutTemplate_configId_fkey" FOREIGN KEY ("configId") REFERENCES "public"."SinkCutoutConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SinkCutoutConfig" ADD CONSTRAINT "SinkCutoutConfig_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SinkCutoutConfig" ADD CONSTRAINT "SinkCutoutConfig_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "public"."_EdgeModificationPoints" ADD CONSTRAINT "_EdgeModificationPoints_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."EdgeModification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EdgeModificationPoints" ADD CONSTRAINT "_EdgeModificationPoints_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Point"("id") ON DELETE CASCADE ON UPDATE CASCADE;
