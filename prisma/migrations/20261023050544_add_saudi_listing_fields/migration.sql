-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "badge" TEXT,
ADD COLUMN     "descriptionAr" TEXT,
ADD COLUMN     "flags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "isOffPlan" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "keyFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "locationAr" TEXT,
ADD COLUMN     "projectedYield" TEXT,
ADD COLUMN     "tier" TEXT,
ADD COLUMN     "titleAr" TEXT;
