-- CreateTable
CREATE TABLE "Situation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Situation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Situation_active_order_idx" ON "Situation"("active", "order");

-- AlterTable: Service
ALTER TABLE "Service" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "situationId" TEXT;

-- CreateIndex
CREATE INDEX "Service_featured_deletedAt_idx" ON "Service"("featured", "deletedAt");

-- CreateIndex
CREATE INDEX "Service_situationId_idx" ON "Service"("situationId");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_situationId_fkey" FOREIGN KEY ("situationId") REFERENCES "Situation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: SuccessCase
ALTER TABLE "SuccessCase" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "SuccessCase_featured_deletedAt_idx" ON "SuccessCase"("featured", "deletedAt");

-- AlterTable: BlogPost
ALTER TABLE "BlogPost" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "BlogPost_featured_deletedAt_idx" ON "BlogPost"("featured", "deletedAt");
