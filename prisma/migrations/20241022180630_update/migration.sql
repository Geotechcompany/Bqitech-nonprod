-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "appliedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "shortlistedDate" TIMESTAMP(3),
    "assessmentDate" TIMESTAMP(3),
    "assessmentScore" DOUBLE PRECISION,
    "interviewDate" TIMESTAMP(3),
    "interviewer" TEXT,
    "hireDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "disqualifiedDate" TIMESTAMP(3),
    "disqualifiedReason" TEXT,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);
