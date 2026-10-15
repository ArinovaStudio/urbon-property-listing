-- CreateEnum
CREATE TYPE "AgentApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'OWNER';

-- CreateTable
CREATE TABLE "AgentApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agencyName" TEXT NOT NULL,
    "reraNumber" TEXT NOT NULL,
    "reraState" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" "AgentApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentApplication_userId_key" ON "AgentApplication"("userId");

-- CreateIndex
CREATE INDEX "AgentApplication_status_createdAt_idx" ON "AgentApplication"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AgentApplication_reraState_reraNumber_key" ON "AgentApplication"("reraState", "reraNumber");

-- AddForeignKey
ALTER TABLE "AgentApplication" ADD CONSTRAINT "AgentApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
