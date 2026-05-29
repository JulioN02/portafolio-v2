-- DropIndex
DROP INDEX "SuccessCase_deletedAt_idx";

-- AlterTable
ALTER TABLE "SuccessCase" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "SuccessCase_featured_deletedAt_idx" ON "SuccessCase"("featured", "deletedAt");

-- CreateIndex
CREATE INDEX "SuccessCase_order_createdAt_idx" ON "SuccessCase"("order", "createdAt");
