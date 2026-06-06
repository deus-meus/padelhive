-- Correct the UTC offset bug for existing bookings.
-- Previously, startsAt and endsAt were stored as WIB wall-clock time disguised as UTC,
-- meaning they were 7 hours ahead of actual UTC.
-- This subtracts 7 hours to align them with the correct UTC instant.
UPDATE "Booking" SET "startsAt" = "startsAt" - INTERVAL '7 hours', "endsAt" = "endsAt" - INTERVAL '7 hours';