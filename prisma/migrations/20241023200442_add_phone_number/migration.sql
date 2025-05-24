/*
  Warnings:

  - Added the required column `experience` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hearAbout` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resumeUrl` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salary` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "experience" TEXT NOT NULL,
ADD COLUMN     "hearAbout" TEXT NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "otherSource" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "resumeUrl" TEXT NOT NULL,
ADD COLUMN     "salary" TEXT NOT NULL;
