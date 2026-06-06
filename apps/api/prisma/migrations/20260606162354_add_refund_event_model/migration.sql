-- CreateTable
CREATE TABLE "RefundEvent" (
    "id" TEXT NOT NULL,
    "refundId" TEXT NOT NULL,
    "fromStatus" "RefundStatus",
    "toStatus" "RefundStatus" NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefundEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RefundEvent_refundId_idx" ON "RefundEvent"("refundId");

-- CreateIndex
CREATE INDEX "RefundEvent_actorUserId_idx" ON "RefundEvent"("actorUserId");

-- CreateIndex
CREATE INDEX "RefundEvent_createdAt_idx" ON "RefundEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "RefundEvent" ADD CONSTRAINT "RefundEvent_refundId_fkey" FOREIGN KEY ("refundId") REFERENCES "Refund"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundEvent" ADD CONSTRAINT "RefundEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
