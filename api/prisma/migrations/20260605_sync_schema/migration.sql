-- REPAIRED 2026-08-31 (SDD change project-publications, P1-01):
-- This migration was a full-schema dump that re-created enums/tables already
-- created by 20260408033244_init, so it could NEVER replay on a fresh shadow
-- database ("type PostStatus already exists"). All statements below are now
-- idempotent (guarded CREATE TYPE / CREATE TABLE IF NOT EXISTS /
-- CREATE INDEX IF NOT EXISTS). End schema state is unchanged.

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'PRIVATE', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "FormOrigin" AS ENUM ('CLIENT', 'RECRUITER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Service" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "fullDescription" TEXT NOT NULL,
    "includedItems" TEXT[],
    "images" TEXT[],
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "deletedAt" TIMESTAMP(3),
    "technicalExplanation" TEXT,
    "technicalImages" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "fullDescription" TEXT NOT NULL,
    "images" TEXT[],
    "externalLink" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "deletedAt" TIMESTAMP(3),
    "technicalExplanation" TEXT,
    "technicalImages" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Tool" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "fullDescription" TEXT NOT NULL,
    "images" TEXT[],
    "requiresInstall" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "deletedAt" TIMESTAMP(3),
    "technicalExplanation" TEXT,
    "technicalImages" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SuccessCase" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "images" TEXT[],
    "videos" TEXT[],
    "links" TEXT[],
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "SuccessCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SiteSection" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "BlogPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "mediaGallery" TEXT[],
    "body" TEXT NOT NULL,
    "externalLink" TEXT,
    "lessonsLearned" TEXT,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ContactForm" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "whatsapp" TEXT,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "originType" "FormOrigin" NOT NULL,
    "readAt" TIMESTAMP(3),
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "starred" BOOLEAN NOT NULL DEFAULT false,
    "labels" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactForm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");

-- CreateIndex
-- User.email is added by a later migration (20260819030000_sync_schema_drift),
-- so only create this index when the column exists.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'email'
  ) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
  END IF;
END $$;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Service_status_deletedAt_idx" ON "Service"("status", "deletedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Service_publishedAt_idx" ON "Service"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Product_featured_deletedAt_idx" ON "Product"("featured", "deletedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Product_status_deletedAt_idx" ON "Product"("status", "deletedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Product_publishedAt_idx" ON "Product"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Tool_slug_key" ON "Tool"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Tool_featured_deletedAt_idx" ON "Tool"("featured", "deletedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Tool_status_deletedAt_idx" ON "Tool"("status", "deletedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Tool_publishedAt_idx" ON "Tool"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SuccessCase_slug_key" ON "SuccessCase"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SuccessCase_status_deletedAt_idx" ON "SuccessCase"("status", "deletedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SuccessCase_publishedAt_idx" ON "SuccessCase"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SiteSection_key_key" ON "SiteSection"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SiteSection_order_idx" ON "SiteSection"("order");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BlogPost_status_deletedAt_idx" ON "BlogPost"("status", "deletedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BlogPost_publishedAt_idx" ON "BlogPost"("publishedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ContactForm_originType_createdAt_idx" ON "ContactForm"("originType", "createdAt");

-- CreateIndex
-- ContactForm.readAt/archived/starred/labels are added by a later migration
-- (20260819030000_sync_schema_drift), so only create these indexes when the
-- referenced columns exist.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ContactForm' AND column_name = 'readAt'
  ) THEN
    CREATE INDEX IF NOT EXISTS "ContactForm_readAt_idx" ON "ContactForm"("readAt");
  END IF;
END $$;

-- CreateIndex
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ContactForm' AND column_name = 'archived'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ContactForm' AND column_name = 'readAt'
  ) THEN
    CREATE INDEX IF NOT EXISTS "ContactForm_archived_readAt_idx" ON "ContactForm"("archived", "readAt");
  END IF;
END $$;

-- CreateIndex
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ContactForm' AND column_name = 'starred'
  ) THEN
    CREATE INDEX IF NOT EXISTS "ContactForm_starred_createdAt_idx" ON "ContactForm"("starred", "createdAt");
  END IF;
END $$;