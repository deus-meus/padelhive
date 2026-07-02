-- AlterEnum
ALTER TYPE "SplitShareStatus" ADD VALUE 'REFUNDED';

-- AlterTable
ALTER TABLE "BookingSplitShare" ADD COLUMN     "refundedAt" TIMESTAMP(3);
