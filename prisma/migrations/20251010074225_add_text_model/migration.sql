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

    CONSTRAINT "Text_pkey" PRIMARY KEY ("id")
);
