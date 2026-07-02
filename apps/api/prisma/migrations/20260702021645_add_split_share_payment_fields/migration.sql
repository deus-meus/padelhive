-- AlterTable
ALTER TABLE "BookingSplitShare" ADD COLUMN     "method" TEXT,
ADD COLUMN     "provider" TEXT,
ADD COLUMN     "providerRedirectUrl" TEXT,
ADD COLUMN     "providerReference" TEXT,
ADD COLUMN     "providerToken" TEXT;

-- CreateIndex
CREATE INDEX "BookingSplitShare_providerReference_idx" ON "BookingSplitShare"("providerReference");
