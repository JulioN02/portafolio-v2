-- Add status and publishedAt to Service, Product, Tool, SuccessCase
-- Remove featured from Service and SuccessCase
-- Remove order from Service, Product, Tool, SuccessCase
-- Create SiteSection model

-- AlterEnum (add PostStatus if not exists - it already exists from BlogPost migration)

-- AlterTable: Service
ALTER TABLE "Service" ADD COLUMN "status" "PostStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "Service" ADD COLUMN "publishedAt" TIMESTAMPTZ;
ALTER TABLE "Service" DROP COLUMN "featured";
ALTER TABLE "Service" DROP COLUMN "order";
DROP INDEX IF EXISTS "Service_featured_deletedAt_idx";
DROP INDEX IF EXISTS "Service_order_createdAt_idx";
CREATE INDEX "Service_status_deletedAt_idx" ON "Service"("status", "deletedAt");
CREATE INDEX "Service_publishedAt_idx" ON "Service"("publishedAt");

-- AlterTable: Product
ALTER TABLE "Product" ADD COLUMN "status" "PostStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "Product" ADD COLUMN "publishedAt" TIMESTAMPTZ;
ALTER TABLE "Product" DROP COLUMN "order";
DROP INDEX IF EXISTS "Product_order_createdAt_idx";
CREATE INDEX IF NOT EXISTS "Product_featured_deletedAt_idx" ON "Product"("featured", "deletedAt");
CREATE INDEX "Product_status_deletedAt_idx" ON "Product"("status", "deletedAt");
CREATE INDEX "Product_publishedAt_idx" ON "Product"("publishedAt");

-- AlterTable: Tool
ALTER TABLE "Tool" ADD COLUMN "status" "PostStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "Tool" ADD COLUMN "publishedAt" TIMESTAMPTZ;
ALTER TABLE "Tool" DROP COLUMN "order";
DROP INDEX IF EXISTS "Tool_order_createdAt_idx";
CREATE INDEX IF NOT EXISTS "Tool_featured_deletedAt_idx" ON "Tool"("featured", "deletedAt");
CREATE INDEX "Tool_status_deletedAt_idx" ON "Tool"("status", "deletedAt");
CREATE INDEX "Tool_publishedAt_idx" ON "Tool"("publishedAt");

-- AlterTable: SuccessCase
ALTER TABLE "SuccessCase" ADD COLUMN "status" "PostStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "SuccessCase" ADD COLUMN "publishedAt" TIMESTAMPTZ;
ALTER TABLE "SuccessCase" DROP COLUMN "featured";
ALTER TABLE "SuccessCase" DROP COLUMN "order";
DROP INDEX IF EXISTS "SuccessCase_featured_deletedAt_idx";
DROP INDEX IF EXISTS "SuccessCase_order_createdAt_idx";
CREATE INDEX "SuccessCase_status_deletedAt_idx" ON "SuccessCase"("status", "deletedAt");
CREATE INDEX "SuccessCase_publishedAt_idx" ON "SuccessCase"("publishedAt");

-- CreateTable: SiteSection
CREATE TABLE "SiteSection" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "SiteSection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SiteSection_key_key" ON "SiteSection"("key");
CREATE INDEX "SiteSection_order_idx" ON "SiteSection"("order");
