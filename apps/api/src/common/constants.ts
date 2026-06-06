export const PENDING_PAYMENT_TTL_MS = 15 * 60 * 1000;
export const REFUND_WINDOW_MS = 24 * 60 * 60 * 1000;
export const REFUND_ELIGIBLE_REASON = "Full refund eligible: cancelled at least 24 hours before booking start.";
export const REFUND_ELIGIBLE_UNPAID_REASON = "Full refund eligible, but no paid payment exists for this booking.";
export const REFUND_INELIGIBLE_REASON = "Non-refundable: cancellations less than 24 hours before booking start are not eligible.";
