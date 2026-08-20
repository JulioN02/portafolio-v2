-- AlterTable
ALTER TABLE "ContactForm" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "labels" TEXT[],
ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "starred" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "publishedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "publishedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SiteSection" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SuccessCase" ALTER COLUMN "publishedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Tool" ALTER COLUMN "publishedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email" TEXT;

-- CreateIndex
CREATE INDEX "ContactForm_readAt_idx" ON "ContactForm"("readAt");

-- CreateIndex
CREATE INDEX "ContactForm_archived_readAt_idx" ON "ContactForm"("archived", "readAt");

-- CreateIndex
CREATE INDEX "ContactForm_starred_createdAt_idx" ON "ContactForm"("starred", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

