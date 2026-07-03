CREATE TABLE "BookingCharge" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL DEFAULT 'Reschedule price difference',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "providerReference" TEXT,
    "providerRedirectUrl" TEXT,
    "providerToken" TEXT,
    "paidAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BookingCharge_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "BookingCharge_bookingId_idx" ON "BookingCharge"("bookingId");
CREATE INDEX "BookingCharge_status_idx" ON "BookingCharge"("status");
CREATE INDEX "BookingCharge_providerReference_idx" ON "BookingCharge"("providerReference");
ALTER TABLE "BookingCharge" ADD CONSTRAINT "BookingCharge_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TYPE "NotificationType" ADD VALUE 'BALANCE_DUE';
