-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN "slug" TEXT;
UPDATE "BlogPost" SET "slug" = id WHERE "slug" IS NULL;
ALTER TABLE "BlogPost" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_slug_key" UNIQUE ("slug"); 