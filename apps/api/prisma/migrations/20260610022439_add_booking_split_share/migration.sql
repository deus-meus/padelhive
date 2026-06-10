-- CreateEnum
CREATE TYPE "SplitShareStatus" AS ENUM ('PENDING', 'PAID');

-- CreateTable
CREATE TABLE "BookingSplitShare" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "inviteId" TEXT,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "amount" INTEGER NOT NULL,
    "status" "SplitShareStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingSplitShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingSplitShare_bookingId_idx" ON "BookingSplitShare"("bookingId");

-- AddForeignKey
ALTER TABLE "BookingSplitShare" ADD CONSTRAINT "BookingSplitShare_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
